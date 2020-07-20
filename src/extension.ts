import {
  window,
  workspace,
  StatusBarAlignment,
  StatusBarItem,
} from 'vscode'
import * as fs from 'fs'
import LRUCache from './LRUCache'

const cache = new LRUCache()

const sizeConvert = (size: number): string => {
  if (size >= 1048576) return `${Math.floor(size / 10485.76) / 100} MB`
  else if (size >= 1024) return `${Math.floor(size / 10.24) / 100} KB`
  else return `${size} B`
}

function update (bar: StatusBarItem, useCache = false): void {
  const editor = window.activeTextEditor
  if (editor && !editor.document.isUntitled && editor.document.uri.scheme === 'file') {
    const path = editor.document.fileName
    let text
    if (useCache) {
      text = cache.get(path)
    }
    if (!text) {
      text = sizeConvert(fs.statSync(path).size)
      cache.set(path, text)
    }
    bar.text = text
  } else {
    bar.text = ''
  }
}

export function activate (): void {
  const bar = window.createStatusBarItem(StatusBarAlignment.Right, 0)
  update(bar)
  bar.show()
  workspace.onDidSaveTextDocument(() => update(bar))
  workspace.onDidChangeTextDocument(() => update(bar))
  window.onDidChangeActiveTextEditor(() => update(bar, true))
}

export function deactivate (): void {
}
