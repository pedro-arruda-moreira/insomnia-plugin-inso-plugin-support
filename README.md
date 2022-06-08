# insomnia-plugin-inso-plugin-support
A (very!) hacky way to support insomnia plugins in inso-cli

## Hot to get it?
```sh
# npm install -g insomnia-plugin-inso-plugin-support
```

## How to use it?
- When placed inside insomnia application as a plugin: It just creates a information screen that warns the user it's not actually a plugin.
- When used as a standalone application:
```sh
$ set INSO_EXTRA_PLUGINS_PATH=/path/to/a/directory/containing/plugins
$ # same command line options as inso.
$ inso-with-plugins run test --ci
$ # Be warned: after execution, inso may get corrupted, this is very hacky and only
$ # suitable for CI builds with ephemeral virtual disks (e.g. AWS CodeBuild)
```

## Enjoy :)
