import React, { HTMLAttributes } from 'react'

type Position = {
  x: number
  y: number
}

type UpdateProps = {
  translate: Position
  minTranslate: Position
  maxTranslate: Position
  width: number
  height: number
}

type ContainerProps = {
  scrollTop: number
  scrollLeft: number
  scrollHeight: number
  scrollWidth: number
  clientHeight: number
  clientWidth: number
}

type Props = {
  // using `interface` is also ok
  container: ContainerProps
  onScrollCallback: (position: Position) => void
}

export default class AutoScroller extends React.Component {
  container: ContainerProps
  onScrollCallback: (position: Position) => void
  interval: any | null
  isAutoScrolling: boolean

  constructor(container: ContainerProps, onScrollCallback: (position: Position) => void) {
    console.log('Constructor')
    super(container, onScrollCallback)
    this.container = container
    this.onScrollCallback = onScrollCallback
    this.interval = null
    this.isAutoScrolling = false
  }

  clear() {
    if (this.interval == null) {
      return
    }

    clearInterval(this.interval)
    this.interval = null
  }

  update({ translate, minTranslate, maxTranslate, width, height }: UpdateProps) {
    const direction = {
      x: 0,
      y: 0,
    }
    const speed = {
      x: 1,
      y: 1,
    }
    const acceleration = {
      x: 10,
      y: 10,
    }

    const {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
    } = this.container

    const isTop = scrollTop === 0
    const isBottom = scrollHeight - scrollTop - clientHeight === 0
    const isLeft = scrollLeft === 0
    const isRight = scrollWidth - scrollLeft - clientWidth === 0
    console.log('Updating Autoscroll', {
      y: translate.y,
      maxY: maxTranslate.y,
      greater: maxTranslate.y - height / 2,
      less: minTranslate.y + height / 2,
    })
    if (translate.y >= maxTranslate.y - height / 2 && !isBottom) {
      console.log('Scroll Down')
      // Scroll Down
      direction.y = 1
      speed.y = acceleration.y * Math.abs((maxTranslate.y - height / 2 - translate.y) / height)
    } else if (translate.x >= maxTranslate.x - width / 2 && !isRight) {
      console.log('Scroll Right')
      // Scroll Right
      direction.x = 1
      speed.x = acceleration.x * Math.abs((maxTranslate.x - width / 2 - translate.x) / width)
    } else if (translate.y <= minTranslate.y + height / 2 && !isTop) {
      console.log('Scroll Up')
      // Scroll Up
      direction.y = -1
      speed.y = acceleration.y * Math.abs((translate.y - height / 2 - minTranslate.y) / height)
    } else if (translate.x <= minTranslate.x + width / 2 && !isLeft) {
      console.log('Scroll Left')
      // Scroll Left
      direction.x = -1
      speed.x = acceleration.x * Math.abs((translate.x - width / 2 - minTranslate.x) / width)
    }

    if (this.interval) {
      this.clear()
      this.isAutoScrolling = false
    }

    if (direction.x !== 0 || direction.y !== 0) {
      this.interval = setInterval(() => {
        this.isAutoScrolling = true
        const offset = {
          x: speed.x * direction.x,
          y: speed.y * direction.y,
        }
        // console.log("Updating Scroll Positions", {
        //   offset,
        //   oldScrollTop: this.container.scrollTop
        // });
        // this.container.scrollTop += offset.x;
        // this.container.scrollLeft += offset.y;
        window.scrollTo(offset.x, offset.y)
        // console.log({ newScrollTop: this.container.scrollTop });
        // this.onScrollCallback(offset);
      }, 5)
    }
  }
}
