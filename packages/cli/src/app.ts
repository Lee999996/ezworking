import {
  buildInstallCommand,
  buildUninstallCommand,
} from '@stricli/auto-complete'
import { buildApplication, buildRouteMap } from '@stricli/core'

import { description, name, version } from '../package.json'
import { addCommand } from './commands/add/command'
import { initCommand } from './commands/init/command'
import { loginCommand } from './commands/login/command'

const routes = buildRouteMap({
  routes: {
    login: loginCommand,
    init: initCommand,
    add: addCommand,
    install: buildInstallCommand('cli', { bash: '__cli_bash_complete' }),
    uninstall: buildUninstallCommand('cli', { bash: true }),
  },
  docs: {
    brief: description,
    hideRoute: {
      install: true,
      uninstall: true,
    },
  },
})

export const app = buildApplication(routes, {
  name,
  versionInfo: {
    currentVersion: version,
  },
})
