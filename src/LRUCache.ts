// https://github.com/isaacs/node-lru-cache

class Node<T> {
  next!: Node<T> | DummyNode<T>
  prev!: Node<T> | DummyNode<T>
  key: string
  value: T
  constructor (key: string, value: T) {
    this.key = key
    this.value = value
  }
}

class DummyNode<T> {
  next: Node<T> | DummyNode<T> | null = null
  prev: Node<T> | DummyNode<T> | null = null
}

class DoublyLinkedList<T> {
  private head: DummyNode<T>
  private tail: DummyNode<T>
  private length = 0

  constructor () {
    this.head = new DummyNode()
    this.tail = new DummyNode()
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  size (): number {
    return this.length
  }

  add (node: Node<T>): void {
    if (this.head.next) {
      node.next = this.head.next
      node.prev = this.head
      this.head.next.prev = node
      this.head.next = node
      this.length++
    }
  }

  remove (node: Node<T>): void {
    const prev = node.prev
    const next = node.next
    node.prev.next = next
    next.prev = prev
    this.length--
  }

  pop (): Node<T> | null {
    if (this.tail.prev instanceof Node) {
      const last = this.tail.prev
      this.remove(last)
      return last
    }
    return null
  }

  getLast (): Node<T> | null {
    return this.tail.prev instanceof Node ? this.tail.prev : null
  }
}

function time (): number {
  return (new Date()).getTime()
}

export default class LRUCache<T = string> {
  private map: Map<string, [Node<T>, Node<number>]>
  private dataList: DoublyLinkedList<T>
  private timestampList: DoublyLinkedList<number>
  private capacity: number
  private expire: number

  constructor (capacity = 20, expire = 10 * 60) {
    this.map = new Map()
    this.dataList = new DoublyLinkedList()
    this.timestampList = new DoublyLinkedList()
    this.capacity = capacity
    this.expire = expire * 1000
  }

  get (key: string): T | undefined {
    const result = this.map.get(key)
    if (result) {
      if (result[1].value + this.expire >= time()) {
        this.dataList.remove(result[0])
        this.dataList.add(result[0])
        return result[0].value
      } else {
        this.dataList.remove(result[0])
        this.timestampList.remove(result[1])
        this.map.delete(key)
      }
    }
    return undefined
  }

  set (key: string, value: T): void {
    const dataNode = new Node(key, value)
    const timestampNode = new Node(key, time())
    const result = this.map.get(key)
    if (result) {
      this.dataList.remove(result[0])
      this.timestampList.remove(result[1])
    } else {
      if (this.dataList.size() >= this.capacity) {
        const tLast = this.timestampList.getLast()
        if (tLast && time() > tLast.value + this.expire) {
          const result = this.map.get(tLast.key)
          if (result) {
            this.timestampList.pop()
            this.dataList.remove(result[0])
            this.map.delete(tLast.key)
          }
        } else {
          const dLast = this.dataList.getLast()
          if (dLast) {
            const result = this.map.get(dLast.key)
            if (result) {
              this.dataList.pop()
              this.timestampList.remove(result[1])
              this.map.delete(dLast.key)
            }
          }
        }
      }
    }
    this.dataList.add(dataNode)
    this.timestampList.add(timestampNode)
    this.map.set(key, [dataNode, timestampNode])
  }
}
