const path = require('path')

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('before:browser:launch', (browser, args) => {
    console.log('launching browser %o', browser)

    // only load React DevTools extension
    // when opening Chrome in interactive mode
    if (browser.family === 'chromium') {
      // we could also restrict the extension
      // to only load when "browser.isHeaded" is true
      const extensionFolder = 'C:/Users/Azule/AppData/Local/Google/Chrome/User Data/Profile 1/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.8.2_0'
      
      console.log('adding React DevTools extension from', extensionFolder)
      // args.push(`--load-extension=${extensionFolder}`)

      return args
    }
  })
}
