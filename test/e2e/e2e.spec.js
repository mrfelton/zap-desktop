import { Application } from 'spectron'
import electronPath from 'electron'
import path from 'path'
import { mainLog } from 'lib/utils/log'

jest.setTimeout(20000)
jest.unmock('electron')

const appPath = path.join(__dirname, '..', '..', 'app')

describe('main window', function spec() {
  beforeAll(async () => {
    mainLog.debug('before')
    this.app = new Application({
      path: electronPath,
      args: [appPath],
      chromeDriverLogPath: path.join(__dirname, '..', '..', 'chromeDriverLog.txt'),
      // startTimeout: 10000,
      // waitTimeout: 10000,
      // quitTimeout: 10000,
      env: {
        NODE_ENV: 'test'
      }
    })

    await this.app.start()
    await this.app.client.waitUntilWindowLoaded()
  })

  afterAll(async () => {
    mainLog.debug('after...')
    if (this.app && this.app.isRunning()) {
      mainLog.debug('stopping...')
      await this.app.stop()
      mainLog.debug('stopped.')
    }
  })

  it('should open window', async () => {
    mainLog.debug('test1')
    const { client, browserWindow } = this.app

    mainLog.debug('loaded')
    const title = await browserWindow.getTitle()
    mainLog.debug('got title')
    expect(title).toBe('Zap')

    const windowCount = await client.getWindowCount()
    expect(windowCount).toBe(1)
  })

  it("should haven't any logs in console of main window", async () => {
    mainLog.debug('test2')
    const { client } = this.app

    mainLog.debug('loaded')
    const logs = await client.getRenderProcessLogs()
    mainLog.debug('got logs', logs)
    const logs2 = await client.getMainProcessLogs()
    mainLog.debug('got logs', logs2)
    expect(logs).toHaveLength(0)
  })
})
