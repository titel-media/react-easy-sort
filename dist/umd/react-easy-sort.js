(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('tslib'), require('array-move'), require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'tslib', 'array-move', 'react'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ReactEasySort = {}, global.tslib, global.arrayMove, global.React));
}(this, (function (exports, tslib, arrayMove, React) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var arrayMove__default = /*#__PURE__*/_interopDefaultLegacy(arrayMove);
  var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

  /**
   * This function check if a given point is inside of the items rect.
   * If it's not inside any rect, it will return the index of the closest rect
   */
  var findItemIndexAtPosition = function findItemIndexAtPosition(_a, itemsRect, _b) {
    var x = _a.x,
        y = _a.y;
    var _c = (_b === void 0 ? {} : _b).fallbackToClosest,
        fallbackToClosest = _c === void 0 ? false : _c;
    var smallestDistance = 10000;
    var smallestDistanceIndex = -1;

    for (var index = 0; index < itemsRect.length; index += 1) {
      var rect = itemsRect[index]; // if it's inside the rect, we return the current index directly

      if (x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom) {
        return index;
      }

      if (fallbackToClosest) {
        // otherwise we compute the distance and update the smallest distance index if needed
        var itemCenterX = (rect.left + rect.right) / 2;
        var itemCenterY = (rect.top + rect.bottom) / 2;
        var distance = Math.sqrt(Math.pow(x - itemCenterX, 2) + Math.pow(y - itemCenterY, 2)); // ** 2 operator is not supported on IE11

        if (distance < smallestDistance) {
          smallestDistance = distance;
          smallestDistanceIndex = index;
        }
      }
    }

    return smallestDistanceIndex;
  };

  var getMousePoint = function getMousePoint(e) {
    return {
      x: Number(e.clientX),
      y: Number(e.clientY)
    };
  };

  var getTouchPoint = function getTouchPoint(touch) {
    return {
      x: Number(touch.clientX),
      y: Number(touch.clientY)
    };
  };

  var getPointInContainer = function getPointInContainer(point, containerTopLeft) {
    return {
      x: point.x - containerTopLeft.x,
      y: point.y - containerTopLeft.y
    };
  };

  var preventDefault = function preventDefault(event) {
    event.preventDefault();
  };

  var disableContextMenu = function disableContextMenu() {
    window.addEventListener('contextmenu', preventDefault, {
      capture: true,
      passive: false
    });
  };

  var enableContextMenu = function enableContextMenu() {
    window.removeEventListener('contextmenu', preventDefault);
  };

  var useDrag = function useDrag(_a) {
    var onStart = _a.onStart,
        onMove = _a.onMove,
        onEnd = _a.onEnd,
        containerRef = _a.containerRef; // contains the top-left coordinates of the container in the window. Set on drag start and used in drag move

    var containerPositionRef = React__default['default'].useRef({
      x: 0,
      y: 0
    }); // on touch devices, we only start the drag gesture after pressing the item 200ms.
    // this ref contains the timer id to be able to cancel it

    var handleTouchStartTimerRef = React__default['default'].useRef(undefined); // on non-touch device, we don't call onStart on mouse down but on the first mouse move
    // we do this to let the user clicks on clickable element inside the container
    // this means that the drag gesture actually starts on the fist move

    var isFirstMoveRef = React__default['default'].useRef(false); // see https://twitter.com/ValentinHervieu/status/1324407814970920968
    // we do this so that the parent doesn't have to use `useCallback()` for these callbacks

    var callbacksRef = React__default['default'].useRef({
      onStart: onStart,
      onMove: onMove,
      onEnd: onEnd
    }); // instead of relying on hacks to know if the device is a touch device or not,
    // we track this using an onTouchStart listener on the document. (see https://codeburst.io/the-only-way-to-detect-touch-with-javascript-7791a3346685)

    var _b = React__default['default'].useState(false),
        isTouchDevice = _b[0],
        setTouchDevice = _b[1];

    React__default['default'].useEffect(function () {
      callbacksRef.current = {
        onStart: onStart,
        onMove: onMove,
        onEnd: onEnd
      };
    }, [onStart, onMove, onEnd]);

    var cancelTouchStart = function cancelTouchStart() {
      if (handleTouchStartTimerRef.current) {
        window.clearTimeout(handleTouchStartTimerRef.current);
      }
    };

    var saveContainerPosition = React__default['default'].useCallback(function () {
      if (containerRef.current) {
        var bounds = containerRef.current.getBoundingClientRect();
        containerPositionRef.current = {
          x: bounds.left,
          y: bounds.top
        };
      }
    }, [containerRef]);
    var onDrag = React__default['default'].useCallback(function (pointInWindow) {
      var point = getPointInContainer(pointInWindow, containerPositionRef.current);

      if (callbacksRef.current.onMove) {
        callbacksRef.current.onMove({
          pointInWindow: pointInWindow,
          point: point
        });
      }
    }, []);
    var onMouseMove = React__default['default'].useCallback(function (e) {
      // if this is the first move, we trigger the onStart logic
      if (isFirstMoveRef.current) {
        isFirstMoveRef.current = false;
        var pointInWindow = getMousePoint(e);
        var point = getPointInContainer(pointInWindow, containerPositionRef.current);

        if (callbacksRef.current.onStart) {
          callbacksRef.current.onStart({
            point: point,
            pointInWindow: pointInWindow
          });
        }
      } // otherwise, we do the normal move logic
      else {
          onDrag(getMousePoint(e));
        }
    }, [onDrag]);
    var onTouchMove = React__default['default'].useCallback(function (e) {
      if (e.cancelable) {
        // Prevent the whole page from scrolling
        e.preventDefault();
        onDrag(getTouchPoint(e.touches[0]));
      } else {
        // if the event is not cancelable, it means the browser is currently scrolling
        // which cannot be interrupted. Thus we cancel the drag gesture.
        document.removeEventListener('touchmove', onTouchMove);

        if (callbacksRef.current.onEnd) {
          callbacksRef.current.onEnd();
        }
      }
    }, [onDrag]);
    var onMouseUp = React__default['default'].useCallback(function () {
      isFirstMoveRef.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      if (callbacksRef.current.onEnd) {
        callbacksRef.current.onEnd();
      }
    }, [onMouseMove]);
    var onTouchEnd = React__default['default'].useCallback(function () {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      enableContextMenu();

      if (callbacksRef.current.onEnd) {
        callbacksRef.current.onEnd();
      }
    }, [onTouchMove]);
    var onMouseDown = React__default['default'].useCallback(function (e) {
      if (e.button !== 0) {
        // we don't want to handle clicks other than left ones
        return;
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      saveContainerPosition(); // mark the next move as being the first one

      isFirstMoveRef.current = true;
    }, [onMouseMove, onMouseUp, saveContainerPosition]);
    var handleTouchStart = React__default['default'].useCallback(function (point, pointInWindow) {
      document.addEventListener('touchmove', onTouchMove, {
        capture: false,
        passive: false
      });
      document.addEventListener('touchend', onTouchEnd);
      disableContextMenu();

      if (callbacksRef.current.onStart) {
        callbacksRef.current.onStart({
          point: point,
          pointInWindow: pointInWindow
        });
      }
    }, [onTouchEnd, onTouchMove]);
    var onTouchStart = React__default['default'].useCallback(function (e) {
      saveContainerPosition();
      var pointInWindow = getTouchPoint(e.touches[0]);
      var point = getPointInContainer(pointInWindow, containerPositionRef.current); // we wait 120ms to start the gesture to be sure that the user
      // is not trying to scroll the page

      handleTouchStartTimerRef.current = window.setTimeout(function () {
        return handleTouchStart(point, pointInWindow);
      }, 120);
    }, [handleTouchStart, saveContainerPosition]);
    var detectTouchDevice = React__default['default'].useCallback(function () {
      setTouchDevice(true);
      document.removeEventListener('touchstart', detectTouchDevice);
    }, []); // if the user is scrolling on mobile, we cancel the drag gesture

    var touchScrollListener = React__default['default'].useCallback(function () {
      cancelTouchStart();
    }, []);
    React__default['default'].useLayoutEffect(function () {
      if (isTouchDevice) {
        var container_1 = containerRef.current;
        container_1 === null || container_1 === void 0 ? void 0 : container_1.addEventListener('touchstart', onTouchStart, {
          capture: true,
          passive: false
        }); // we are adding this touchmove listener to cancel drag if user is scrolling
        // however, it's also important to have a touchmove listener always set
        // with non-capture and non-passive option to prevent an issue on Safari
        // with e.preventDefault (https://github.com/atlassian/react-beautiful-dnd/issues/1374)

        document.addEventListener('touchmove', touchScrollListener, {
          capture: false,
          passive: false
        });
        document.addEventListener('touchend', touchScrollListener, {
          capture: false,
          passive: false
        });
        return function () {
          container_1 === null || container_1 === void 0 ? void 0 : container_1.removeEventListener('touchstart', onTouchStart);
          document.removeEventListener('touchmove', touchScrollListener);
          document.removeEventListener('touchend', touchScrollListener);
          document.removeEventListener('touchmove', onTouchMove);
          document.removeEventListener('touchend', onTouchEnd);
          enableContextMenu();
          cancelTouchStart();
        };
      } // if non-touch device


      document.addEventListener('touchstart', detectTouchDevice);
      return function () {
        document.removeEventListener('touchstart', detectTouchDevice);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }, [isTouchDevice, detectTouchDevice, onMouseMove, onTouchMove, touchScrollListener, onTouchEnd, onMouseUp, containerRef, onTouchStart]); // on touch devices, we cannot attach the onTouchStart directly via React:
    // Touch handlers must be added with {passive: false} to be cancelable.
    // https://developers.google.com/web/updates/2017/01/scrolling-intervention

    return isTouchDevice ? {} : {
      onMouseDown: onMouseDown
    };
  };

  var SortableListContext = /*#__PURE__*/React__default['default'].createContext(undefined);

  var SortableList = function SortableList(_a) {
    var children = _a.children,
        onSortEnd = _a.onSortEnd,
        draggedItemClassName = _a.draggedItemClassName,
        rest = tslib.__rest(_a, ["children", "onSortEnd", "draggedItemClassName"]); // this array contains the elements than can be sorted (wrapped inside SortableItem)


    var itemsRef = React__default['default'].useRef([]); // this array contains the coordinates of each sortable element (only computed on dragStart and used in dragMove for perf reason)

    var itemsRect = React__default['default'].useRef([]); // contains the container element

    var containerRef = React__default['default'].useRef(null); // contains the target element (copy of the source element)

    var targetRef = React__default['default'].useRef(null); // contains the index in the itemsRef array of the element being dragged

    var sourceIndexRef = React__default['default'].useRef(undefined); // contains the index in the itemsRef of the element to be exchanged with the source item

    var lastTargetIndexRef = React__default['default'].useRef(undefined);
    React__default['default'].useEffect(function () {
      return function () {
        // cleanup the target element from the DOM when SortableList in unmounted
        if (targetRef.current) {
          document.body.removeChild(targetRef.current);
        }
      };
    }, []);

    var updateTargetPosition = function updateTargetPosition(position) {
      if (targetRef.current) {
        // we use `translate3d` to force using the GPU if available
        targetRef.current.style.transform = "translate(-50%, -50%) translate3d(" + position.x + "px, " + position.y + "px, 0px)";
      }
    };

    var copyItem = React__default['default'].useCallback(function (sourceIndex) {
      if (!containerRef.current) {
        return;
      }

      var source = itemsRef.current[sourceIndex];
      var sourceRect = itemsRect.current[sourceIndex];
      var copy = source.cloneNode(true); // added the "dragged" class name

      if (draggedItemClassName) {
        draggedItemClassName.split(' ').forEach(function (c) {
          return copy.classList.add(c);
        });
      } // we ensure the copy has the same size than the source element


      copy.style.width = sourceRect.width + "px";
      copy.style.height = sourceRect.height + "px"; // we place the target starting position at the top-left of the container
      // it will then be moved relatively using `transform: translate3d()`

      var containerBounds = containerRef.current.getBoundingClientRect();
      copy.style.position = 'fixed';
      copy.style.top = containerBounds.top + "px";
      copy.style.left = containerBounds.left + "px";
      document.body.appendChild(copy);
      targetRef.current = copy;
    }, [draggedItemClassName]);
    var listeners = useDrag({
      containerRef: containerRef,
      onStart: function onStart(_a) {
        var point = _a.point,
            pointInWindow = _a.pointInWindow;

        if (!containerRef.current) {
          return;
        }

        itemsRect.current = itemsRef.current.map(function (item) {
          return item.getBoundingClientRect();
        });
        var sourceIndex = findItemIndexAtPosition(pointInWindow, itemsRect.current); // if we are not starting the drag gesture on a SortableItem, we exit early

        if (sourceIndex === -1) {
          return;
        } // saving the index of the item being dragged


        sourceIndexRef.current = sourceIndex; // the item being dragged is copied to the document body and will be used as the target

        copyItem(sourceIndex);
        updateTargetPosition(point); // hide source during the drag gesture

        var source = itemsRef.current[sourceIndex];
        source.style.opacity = '0';
        source.style.visibility = 'hidden'; // Adds a nice little physical feedback

        if (window.navigator.vibrate) {
          window.navigator.vibrate(100);
        }
      },
      onMove: function onMove(_a) {
        var point = _a.point,
            pointInWindow = _a.pointInWindow;
        updateTargetPosition(point);
        var sourceIndex = sourceIndexRef.current; // if there is no source, we exit early (happened when drag gesture was started outside a SortableItem)

        if (sourceIndex === undefined) {
          return;
        }

        var targetIndex = findItemIndexAtPosition(pointInWindow, itemsRect.current, {
          fallbackToClosest: true
        }); // if not target detected, we don't need to update other items' position

        if (targetIndex === -1) {
          return;
        } // we keep track of the last target index (to be passed to the onSortEnd callback)


        lastTargetIndexRef.current = targetIndex;
        var isMovingRight = sourceIndex < targetIndex; // in this loop, we go over each sortable item and see if we need to update their position

        for (var index = 0; index < itemsRef.current.length; index += 1) {
          var currentItem = itemsRef.current[index];
          var currentItemRect = itemsRect.current[index]; // if current index is between sourceIndex and targetIndex, we need to translate them

          if (isMovingRight && index >= sourceIndex && index <= targetIndex || !isMovingRight && index >= targetIndex && index <= sourceIndex) {
            // we need to move the item to the previous or next item position
            var nextItemRects = itemsRect.current[isMovingRight ? index - 1 : index + 1];

            if (nextItemRects) {
              var translateX = nextItemRects.left - currentItemRect.left;
              var translateY = nextItemRects.top - currentItemRect.top; // we use `translate3d` to force using the GPU if available

              currentItem.style.transform = "translate3d(" + translateX + "px, " + translateY + "px, 0px)";
            }
          } // otherwise, the item should be at its original position
          else {
              currentItem.style.transform = 'translate3d(0,0,0)';
            } // we want the translation to be animated


          currentItem.style.transitionDuration = '300ms';
        }
      },
      onEnd: function onEnd() {
        // we reset all items translations (the parent is expected to sort the items in the onSortEnd callback)
        for (var index = 0; index < itemsRef.current.length; index += 1) {
          var currentItem = itemsRef.current[index];
          currentItem.style.transform = '';
          currentItem.style.transitionDuration = '';
        }

        var sourceIndex = sourceIndexRef.current;

        if (sourceIndex !== undefined) {
          // show the source item again
          var source = itemsRef.current[sourceIndex];

          if (source) {
            source.style.opacity = '1';
            source.style.visibility = '';
          }

          var targetIndex = lastTargetIndexRef.current;

          if (targetIndex !== undefined) {
            if (sourceIndex !== targetIndex) {
              // sort our internal items array
              itemsRef.current = arrayMove__default['default'](itemsRef.current, sourceIndex, targetIndex); // let the parent know

              onSortEnd(sourceIndex, targetIndex);
            }
          }
        }

        sourceIndexRef.current = undefined;
        lastTargetIndexRef.current = undefined; // cleanup the target element from the DOM

        if (targetRef.current) {
          document.body.removeChild(targetRef.current);
          targetRef.current = null;
        }
      }
    });
    var registerItem = React__default['default'].useCallback(function (_a) {
      var item = _a.item,
          index = _a.index;
      var existingIndex = itemsRef.current.indexOf(item);

      if (existingIndex === -1) {
        itemsRef.current.push(item);
      }

      if (existingIndex !== index) {
        arrayMove__default['default'](itemsRef.current, existingIndex, index);
      }
    }, []);
    var removeItem = React__default['default'].useCallback(function (item) {
      var index = itemsRef.current.indexOf(item);

      if (index !== -1) {
        itemsRef.current.splice(index, 1);
      }
    }, []); // we need to memoize the context to avoid re-rendering every children of the context provider
    // when not needed

    var context = React__default['default'].useMemo(function () {
      return {
        registerItem: registerItem,
        removeItem: removeItem
      };
    }, [registerItem, removeItem]);
    return /*#__PURE__*/React__default['default'].createElement("div", tslib.__assign({}, listeners, rest, {
      ref: containerRef
    }), /*#__PURE__*/React__default['default'].createElement(SortableListContext.Provider, {
      value: context
    }, children));
  };
  /**
   * SortableItem only adds a ref to its children so that we can register it to the main Sortable
   */

  var SortableItem = function SortableItem(_a) {
    var children = _a.children,
        index = _a.index;
    var context = React__default['default'].useContext(SortableListContext);

    if (!context) {
      throw new Error('SortableItem must be a child of SortableList');
    }

    var registerItem = context.registerItem,
        removeItem = context.removeItem;
    var elementRef = React__default['default'].useRef(null);
    React__default['default'].useEffect(function () {
      var currentItem = elementRef.current;

      if (currentItem) {
        registerItem({
          item: currentItem,
          index: index
        });
      }

      return function () {
        if (currentItem) {
          removeItem(currentItem);
        }
      };
    });
    return /*#__PURE__*/React__default['default'].cloneElement(children, {
      ref: elementRef
    });
  };

  exports.SortableItem = SortableItem;
  exports.default = SortableList;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=react-easy-sort.js.map
