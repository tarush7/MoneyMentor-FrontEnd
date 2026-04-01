import {
  Children,
  cloneElement,
  isValidElement,
  useMemo,
  useRef,
  useState
} from 'react';

const joinClasses = (...values) => values.filter(Boolean).join(' ');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getCardId = (child, index) =>
  isValidElement(child) && child.key != null ? String(child.key) : `stack-card-${index}`;

const createInitialCards = (children, randomRotation) =>
  Children.toArray(children).map((child, index) => ({
    id: getCardId(child, index),
    rotateJitter: randomRotation ? Math.random() * 10 - 5 : 0
  }));

const Stack = ({
  randomRotation = false,
  sensitivity = 120,
  cardDimensions = { width: 260, height: 320 },
  sendToBackOnClick = false,
  animationConfig = { stiffness: 260, damping: 20 },
  className,
  style,
  children,
  ...rest
}) => {
  const childArray = Children.toArray(children);

  const [cards, setCards] = useState(() => createInitialCards(children, randomRotation));
  const [dragState, setDragState] = useState(null);
  const skipClickIdRef = useRef(null);

  const childLookup = useMemo(
    () => new Map(childArray.map((child, index) => [getCardId(child, index), child])),
    [childArray]
  );

  const transitionDuration = Math.max(
    180,
    Math.min(360, Math.round(animationConfig.damping * 14))
  );

  const sendToBack = cardId => {
    setCards(prev => {
      const next = [...prev];
      const index = next.findIndex(card => card.id === cardId);

      if (index === -1) return prev;

      const [card] = next.splice(index, 1);
      next.unshift(card);
      return next;
    });
  };

  const handlePointerDown = (cardId, event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragState({
      id: cardId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: 0,
      y: 0
    });
  };

  const handlePointerMove = (cardId, event) => {
    setDragState(prev => {
      if (!prev || prev.id !== cardId) return prev;

      return {
        ...prev,
        x: event.clientX - prev.startX,
        y: event.clientY - prev.startY
      };
    });
  };

  const handlePointerEnd = (cardId, event) => {
    let shouldSendToBack = false;

    setDragState(prev => {
      if (!prev || prev.id !== cardId) return prev;

      shouldSendToBack =
        Math.abs(prev.x) > sensitivity || Math.abs(prev.y) > sensitivity;

      return null;
    });

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (shouldSendToBack) {
      skipClickIdRef.current = cardId;
      sendToBack(cardId);
    }
  };

  return (
    <div
      className={joinClasses('relative', className)}
      style={{
        width: cardDimensions.width,
        height: cardDimensions.height,
        perspective: 600,
        ...style
      }}
      {...rest}
    >
      {cards.map((card, index) => {
        const cardChild = childLookup.get(card.id);
        const isTopCard = index === cards.length - 1;
        const activeDrag = dragState?.id === card.id ? dragState : null;

        const rotateZ = (cards.length - index - 1) * 4 + card.rotateJitter;
        const scale = 1 + index * 0.06 - cards.length * 0.06;
        const dragX = activeDrag?.x ?? 0;
        const dragY = activeDrag?.y ?? 0;
        const rotateX = activeDrag ? clamp(-dragY / 5, -18, 18) : 0;
        const rotateY = activeDrag ? clamp(dragX / 5, -18, 18) : 0;

        const renderedChild = isValidElement(cardChild)
          ? cloneElement(cardChild, {
              className: joinClasses('h-full w-full', cardChild.props.className),
              style: {
                width: '100%',
                height: '100%',
                ...(cardChild.props.style ?? {})
              }
            })
          : cardChild;

        return (
          <div
            key={card.id}
            className={joinClasses(
              'absolute inset-0 select-none touch-none [transform-style:preserve-3d]',
              isTopCard ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
            )}
            style={{
              zIndex: index + 1,
              transform: `translate3d(${dragX}px, ${dragY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
              transformOrigin: '90% 90%',
              transition: activeDrag
                ? 'none'
                : `transform ${transitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`
            }}
            onClick={() => {
              if (skipClickIdRef.current === card.id) {
                skipClickIdRef.current = null;
                return;
              }

              if (isTopCard && sendToBackOnClick) {
                sendToBack(card.id);
              }
            }}
            onPointerDown={event => {
              if (isTopCard) {
                handlePointerDown(card.id, event);
              }
            }}
            onPointerMove={event => {
              if (isTopCard) {
                handlePointerMove(card.id, event);
              }
            }}
            onPointerUp={event => {
              if (isTopCard) {
                handlePointerEnd(card.id, event);
              }
            }}
            onPointerCancel={event => {
              if (isTopCard) {
                handlePointerEnd(card.id, event);
              }
            }}
          >
            {renderedChild}
          </div>
        );
      })}
    </div>
  );
};

export default Stack;
