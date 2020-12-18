import {
  window,
  workspace,
  StatusBarAlignment,
  commands,
  TextDocument,
} from 'vscode'
import * as fs from 'fs'
import LRUCache from '@mkanako/lrucache'

const cache = new LRUCache<string>(30)

function sizeConvert (size: number) {
  if (size >= 1048576) return `${Math.floor(size / 10485.76) / 100} MB`
  else if (size >= 1024) return `${Math.floor(size / 10.24) / 100} KB`
  else return `${size} B`
}

function getSize (document?:TextDocument, useCache = false) {
  document = document || window.activeTextEditor?.document
  if (document && !document.isUntitled && document.uri.scheme === 'file') {
    const path = document.fileName
    let text
    if (useCache) {
      text = cache.get(path)
    }
    if (!text) {
      text = sizeConvert(fs.statSync(path).size)
      cache.set(path, text)
    }
    return text
  } else {
    return ''
  }
}

export function activate (): void {
  const bar = window.createStatusBarItem(StatusBarAlignment.Right, 0)
  const update = new Proxy(getSize, {
    apply (target, _, args) {
      bar.text = target(...args)
    },
  })
  commands.registerCommand('updateSize', () => {
    update()
  })

  update()

  bar.command = 'updateSize'
  bar.tooltip = 'refresh file size'
  bar.show()

  workspace.onDidOpenTextDocument((document) => {
    update(document)
  })
  workspace.onDidSaveTextDocument((document) => {
    update(document)
  })
  window.onDidChangeActiveTextEditor((editor) => {
    update(editor?.document, true)
  })
}

export function deactivate (): void {
}
