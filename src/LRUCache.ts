// https://github.com/isaacs/node-lru-cache
/* eslint-disable @typescript-eslint/no-non-null-assertion */

class Node<T> {
  next: Node<T> | null = null
  prev: Node<T> | null = null
  key: string
  value: T | undefined
  constructor (key: string, value?: T) {
    this.key = key
    this.value = value
  }
}

class DoublyLinkedList<T> {
  private head: Node<T>
  private tail: Node<T>
  private length = 0

  constructor () {
    this.head = new Node('head')
    this.tail = new Node('tail')
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  size (): number {
    return this.length
  }

  add (node: Node<T>): void {
    node.next = this.head.next
    node.prev = this.head
    this.head.next!.prev = node
    this.head.next = node
    this.length++
  }

  remove (node: Node<T>): void {
    const prev = node.prev
    const next = node.next
    node.prev!.next = next
    next!.prev = prev
    this.length--
  }

  pop (): Node<T> | null {
    if (this.tail.prev === this.head) return null
    const last = this.tail.prev
    if (last) {
      this.remove(last)
    }
    return last
  }
}

export default class LRUCache<T> {
  private map: Map<string, [Node<T>, number]>
  private list: DoublyLinkedList<T>
  private capacity: number
  private expire: number

  constructor (capacity = 20, expire = 10 * 60) {
    this.map = new Map()
    this.list = new DoublyLinkedList()
    this.capacity = capacity
    this.expire = expire * 1000
  }

  get (key: string): T | undefined {
    if (this.map.has(key)) {
      const result = this.map.get(key)!
      if (result[1] + this.expire > (new Date()).getTime()) {
        this.list.remove(result[0])
        this.list.add(result[0])
        return result[0].value
      } else {
        this.list.remove(result[0])
        this.map.delete(key)
      }
    }
    return undefined
  }

  set (key: string, value: T): void {
    const node = new Node(key, value)
    if (this.map.has(key)) {
      this.list.remove(this.map.get(key)![0])
    } else {
      if (this.list.size() >= this.capacity) {
        const last = this.list.pop()
        this.map.delete(last!.key)
      }
    }
    this.list.add(node)
    this.map.set(key, [node, (new Date()).getTime()])
  }
}
