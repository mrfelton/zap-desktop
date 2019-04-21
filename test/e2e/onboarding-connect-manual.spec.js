import path from 'path'
import { waitForReact } from 'testcafe-react-selectors'
import {
  getBaseUrl,
  getUserDataDir,
  assertNoConsoleErrors,
  cleanTestEnvironment,
  cleanElectronEnvironment,
} from './utils/helpers'
import Onboarding from './pages/onboarding'
import Loading from './pages/loading'

const onboarding = new Onboarding()
const loading = new Loading()

fixture('Onboarding (connect manual)')
  .page(getBaseUrl())
  .beforeEach(async t => {
    await waitForReact()
    t.fixtureCtx.userDataDir = await getUserDataDir()
  })
  .afterEach(async t => {
    await assertNoConsoleErrors(t)
    await cleanTestEnvironment()
  })
  .after(async ctx => {
    await cleanElectronEnvironment(ctx)
  })

test('should connect to an external wallet (manual)', async t => {
  await t
    // Fill out and submit ConnectionType form.
    .expect(onboarding.connectionType.exists)
    .ok()
    .click(onboarding.connectionTypes.custom.radio)
    .click(onboarding.nextButton)

    // Fill out and submit ConnectionDetails form.
    .expect(onboarding.connectionDetails.exists)
    .ok()
    .click(onboarding.connectionDetailsTabs.manual.button)
    .typeText(onboarding.hostInput, 'testnet1-lnd.zaphq.io:10009')
    .typeText(onboarding.certInput, path.join(__dirname, 'fixtures', 'tls.cert'))
    .typeText(onboarding.macaroonInput, path.join(__dirname, 'fixtures', 'readonly.macaroon'))
    .click(onboarding.nextButton)

    // Confirm connection details and submit
    .expect(onboarding.connectionConfirm.exists)
    .ok()
    .click(onboarding.nextButton)

    // Verify that we show the loading bolt and then the wallet page.
    .expect(loading.loadingBolt.exists)
    .ok()
})
