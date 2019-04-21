import { waitForReact } from 'testcafe-react-selectors'
import {
  getBaseUrl,
  getUserDataDir,
  assertNoConsoleErrors,
  cleanTestEnvironment,
  cleanElectronEnvironment,
} from './utils/helpers'
import Onboarding from './pages/onboarding'
import Syncing from './pages/syncing'
import Loading from './pages/loading'

const onboarding = new Onboarding()
const syncing = new Syncing()
const loading = new Loading()

fixture('Onboarding (create)')
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

test('should create a new wallet', async t => {
  await t
    // Fill out and submit ConnectionType form.
    .expect(onboarding.connectionType.exists)
    .ok()
    .click(onboarding.nextButton)

    // Wait for SeedView to generate seed and then submit the form.
    .expect(onboarding.seedView.withProps({ isFetchingSeed: false }).exists)
    .ok()
    .expect(onboarding.nextButton.hasAttribute('disabled'))
    .notOk('ready to be clicked')
    .click(onboarding.nextButton)

    // Ensure we navigate to the SeedConfirm step next.
    .expect(onboarding.seedConfirm.exists)
    .ok()

  // Select the relevant seed words.
  const seedConfirmState = await onboarding.seedConfirm.getReact()
  const { seed } = seedConfirmState.props
  const word1 = seed[seedConfirmState.state.seedWordIndexes[0] - 1]
  const word2 = seed[seedConfirmState.state.seedWordIndexes[1] - 1]
  const word3 = seed[seedConfirmState.state.seedWordIndexes[2] - 1]

  // Fill out and submit SeedConfirm form.
  await t
    .typeText(onboarding.seeedWordInput1, word1)
    .typeText(onboarding.seeedWordInput2, word2)
    .typeText(onboarding.seeedWordInput3, word3)
    .click(onboarding.nextButton)

    // Fill out and submit Password form.
    .typeText(onboarding.passwordInput, 'password')
    .click(onboarding.nextButton)

    // Fill out and submit Name form.
    .typeText(onboarding.nameInput, 'My Test Wallet')
    .click(onboarding.nextButton)

    // Fill out and submit Network form.
    .expect(onboarding.network.exists)
    .ok()
    .click(onboarding.nextButton)

    // Fill out and submit Autopilot form.
    .expect(onboarding.autopilot.exists)
    .ok()
    .click(onboarding.nextButton)

    // Verify that we show the loading bolt and syncing page.
    .expect(loading.loadingBolt.exists)
    .ok()
    .expect(syncing.syncing.exists)
    .ok()
})
