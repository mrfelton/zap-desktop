import { Application } from 'spectron'
import electronPath from 'electron'
import path from 'path'

jest.setTimeout(20000)
jest.unmock('electron')

const appPath = path.join(__dirname, '..', '..', 'app')

describe('main window', function spec() {
  beforeAll(async () => {
    console.log('before')
    this.app = new Application({
      path: electronPath,
      args: [appPath],
      chromeDriverLogPath: path.join(__dirname, '..', '..', 'chromeDriverLog.txt'),
      // startTimeout: 10000,
      // waitTimeout: 10000,
      quitTimeout: 20000,
      env: {
        NODE_ENV: 'test'
      }
    })

    await this.app.start()
    await this.app.client.waitUntilWindowLoaded()
  })

  afterAll(async () => {
    console.log('after...')
    if (this.app && this.app.isRunning()) {
      console.log('stopping...')
      await this.app.stop()

      exec(`pkill -f "${appPath}"`)
      console.log('stopped.')
    }
  })

  it('should open window', async () => {
    console.log('test1')
    const { client, browserWindow } = this.app

    console.log('loaded')
    const title = await browserWindow.getTitle()
    console.log('got title')
    expect(title).toBe('Zap')

    const windowCount = await client.getWindowCount()
    expect(windowCount).toBe(1)
  })

  it("should haven't any logs in console of main window", async () => {
    console.log('test2')
    const { client } = this.app

    console.log('loaded')
    const logs = await client.getRenderProcessLogs()
    console.log('got logs', logs)
    const logs2 = await client.getMainProcessLogs()
    console.log('got logs', logs2)
    expect(logs).toHaveLength(0)
  })
})
