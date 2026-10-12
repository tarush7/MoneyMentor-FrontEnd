// Run with Vite on 127.0.0.1:5173 and a dedicated headless Chrome on debugging port 9334.
// Command: node tests/option-wheel.browser.mjs. The test closes its browser after success.
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const targets = await fetch('http://127.0.0.1:9334/json').then((response) => response.json())
const target = targets.find((item) => item.type === 'page')
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
let nextId = 0
const pending = new Map()
const errors = []
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data)
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text)
  const waiter = pending.get(message.id)
  if (waiter) {
    pending.delete(message.id)
    if (message.error) waiter.reject(new Error(message.error.message))
    else waiter.resolve(message.result)
  }
}
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)) }, 10000)
    pending.set(id, { resolve: (result) => { clearTimeout(timer); resolve(result) }, reject: (error) => { clearTimeout(timer); reject(error) } })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception.description)
  return result.result.value
}
const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms))
const trigger = 'button[aria-label="Choose dashboard month"]'
const selected = () => evaluate('document.querySelector("[role=option][aria-selected=true]")?.textContent')
const isOpen = () => evaluate(`!!document.querySelector('[role="dialog"][aria-label="Choose dashboard month"]')`)
async function open() { await evaluate(`document.querySelector('${trigger}').click()`); await wait() }
async function button(label) {
  await evaluate(`Array.from(document.querySelectorAll('button')).find(el => el.textContent.trim() === '${label}').click()`)
  await wait()
}
async function key(keyName, code = keyName) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code })
  await wait()
}
async function viewport(width, height, mobile = false) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile })
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile })
  await wait()
}
async function screenshot(name) {
  const result = await send('Page.captureScreenshot', { format: 'png' })
  await writeFile(new URL(name, import.meta.url), Buffer.from(result.data, 'base64'))
}



async function load(auto = true) {
  await send('Page.navigate', {url:'http://127.0.0.1:5173/tests/fixtures/option-wheel.html'+(auto?'?auto':'')})
  for(let i=0;i<40;i++) {
    if(await evaluate('window.__wheelFixture?.ready === true')) break
    await wait(50)
  }
  await wait(100)
  assert(await evaluate('window.__wheelFixture?.ready === true'))
}
async function wheels(deltas, mode=0) {
  await evaluate(`(() => {const wheel=document.querySelector('[role=listbox]'); for(const deltaY of ${JSON.stringify(deltas)}) wheel.dispatchEvent(new WheelEvent('wheel', {deltaY,deltaMode:${mode},bubbles:true,cancelable:true}));})()`)
}
const commits = () => evaluate('window.__wheelFixture.commits')
async function settledCount(expected) {
  for(let i=0;i<40;i++) {
    if((await commits()).length >= expected) break
    await wait(50)
  }
  await wait(60)
  const values=await commits()
  assert.equal(values.length,expected,JSON.stringify(values))
  return values
}
async function center() {return evaluate(`(() => {const r=document.querySelector('[role=listbox]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)}
await send('Runtime.enable')
await send('Page.enable')
await viewport(1440,1000)
await load()
assert.equal((await commits()).length,0,'Opening does not commit')
await wheels([-100,-100,-100])
await wait(80)
assert.equal((await commits()).length,0,'Rapid input does not commit intermediate months')
assert.equal((await settledCount(1))[0].label,'July','Three rapid notches accumulate')
assert.equal(await selected(),'July','Centered highlight follows final month')
console.log('Rapid scroll accumulation and final-only commit passed')

await load()
await wheels([-400])
assert.equal((await settledCount(1))[0].label,'June','Large bursts retain all movement')

await load()
await wheels(Array(10).fill(-10))
assert.equal((await settledCount(1))[0].label,'September','Fractional touchpad input accumulates')

await load()
await wheels([-3],1)
assert.equal((await settledCount(1))[0].label,'September','Line wheel units normalize')

await load()
await wheels([-1],2)
assert.equal((await settledCount(1))[0].label,'August','Page wheel units normalize')

await load()
await wheels([-600,100])
assert.equal((await settledCount(1))[0].label,'November','Reversal responds from current visual position')

await load()
await wheels([-100])
await wait(120)
await wheels([-100])
assert.equal((await settledCount(1))[0].label,'August','New input resets the settle delay')
console.log('Large bursts, touchpad, line/page units, reversal and debounce passed')

await load()
const mouse=await center()
await send('Input.dispatchMouseEvent',{type:'mousePressed',...mouse,button:'left',clickCount:1})
await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:mouse.x,y:mouse.y+10,button:'left',buttons:1})
await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:mouse.x,y:mouse.y+108,button:'left',buttons:1})
await wait(350)
assert.equal((await commits()).length,0,'Holding a drag does not commit')
await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:mouse.x,y:mouse.y+108,button:'left',clickCount:1})
assert.equal((await settledCount(1))[0].label,'August','Releasing a drag commits its snapped row')

await viewport(320,640,true)
await load()
const touch=await center()
await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]})
await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touch.x,y:touch.y-54}]})
await wait(300)
assert.equal((await commits()).length,0,'Touch hold does not commit')
await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
assert.equal((await settledCount(1))[0].label,'November','Touch release commits without a tap')
console.log('Mouse and mobile touch drag passed')

await viewport(1440,1000)
await load()
await evaluate('document.querySelector("[role=listbox]").focus()')
for(let i=0;i<4;i++) {
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowUp',code:'ArrowUp',autoRepeat:i>0})
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowUp',code:'ArrowUp'})
}
assert.equal((await settledCount(1))[0].label,'June','Keyboard repeats select automatically once')
await key('Home')
assert.equal((await settledCount(2))[1].label,'January')
await key('ArrowUp')
await wait(400)
assert.equal((await commits()).length,2,'Boundary does not wrap or duplicate')
await key('End')
assert.equal((await settledCount(3))[2].label,'December')
await key('ArrowDown')
await wait(400)
assert.equal((await commits()).length,3)
console.log('Keyboard repeats and boundary deduplication passed')

await load()
await wheels([-100])
await evaluate('window.__wheelFixture.unmount()')
await wait(600)
assert.equal((await commits()).length,0,'Unmount cancels pending selection')

await load()
await wheels([-100])
await evaluate('window.__wheelFixture.replace()')
await wait(600)
assert.equal((await commits()).length,0,'Replacing the wheel cancels old selection')

await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
await load()
await wheels([-100])
assert.equal((await settledCount(1))[0].label,'September','Reduced motion retains idle selection')
await send('Emulation.setEmulatedMedia',{features:[]})

await load(false)
await wheels([-100])
await wait(700)
assert.equal((await commits()).length,0,'Library default still needs explicit selection')
await evaluate('document.querySelector("[role=option][aria-selected=true]").click()')
assert.equal((await settledCount(1))[0].label,'September','Default click selection remains available')
console.log('Cleanup, reduced motion and backward-compatible defaults passed')

await send('Page.navigate',{url:'http://127.0.0.1:5173/dashboard'})
await wait(500)
await evaluate(`document.querySelector('${trigger}').click()`)
await wait(150)
const before=await evaluate(`document.querySelector('${trigger}').textContent.trim()`)
const beforeIndex=await evaluate('Array.from(document.querySelectorAll("[role=listbox][aria-label=Month] [role=option]")).findIndex(el=>el.getAttribute("aria-selected")==="true")')
await wheels([beforeIndex>0?-100:100])
for(let i=0;i<40;i++) {
 if((await evaluate(`document.querySelector('${trigger}').textContent.trim()`))!==before) break
 await wait(50)
}
assert.notEqual(await evaluate(`document.querySelector('${trigger}').textContent.trim()`),before,'Dashboard month label updates without a click')
assert(await isOpen(),'Dashboard popup stays open after automatic selection')
await key('Escape')
assert(!(await isOpen()),'Escape still dismisses popup')
assert.equal(errors.length,0,errors.join(', '))
console.log('PASS: automatic dashboard selection, popup stays open, rapid/large/fractional scroll, reversal, drag/touch, keyboard, boundaries, cleanup, reduced motion, and default manual behavior.')
await send('Browser.close')
socket.close()
