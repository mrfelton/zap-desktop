import { Application } from 'spectron'
import electronPath from 'electron'
import path from 'path'

jest.setTimeout(30000)
jest.unmock('electron')

describe('main window', function spec() {
  beforeEach(() => {
    this.app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..', '..', 'app')],
      chromeDriverLogPath: path.join(__dirname, '..', '..', 'chromeDriverLog.txt'),
      startTimeout: 10000,
      waitTimeout: 10000,
      quitTimeout: 10000,
      env: {
        NODE_ENV: 'test'
      }
    })

    return this.app.start()
  })

  afterEach(() => {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('should open window', async () => {
    const { client, browserWindow } = this.app

    await client.waitUntilWindowLoaded()
    const title = await browserWindow.getTitle()
    expect(title).toBe('Zap')
  })

  it("should haven't any logs in console of main window", async () => {
    const { client } = this.app

    await client.waitUntilWindowLoaded()
    const logs = await client.getRenderProcessLogs()
    expect(logs).toHaveLength(0)
  })
})
