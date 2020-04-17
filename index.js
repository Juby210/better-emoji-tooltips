const { resolve } = require('path')
const { Plugin } = require('powercord/entities')
const { getModule, getModuleByDisplayName, React } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')

const Settings = require('./Settings')

module.exports = class BetterEmojiTooltips extends Plugin {
    async startPlugin() {
        this.registerSettings('better-emoji-tooltips', 'Better Emoji Tooltips', Settings)
        this.loadCSS(resolve(__dirname, 'style.css'))

        const _this = this
        const { getCustomEmojiById } = await getModule(['getCustomEmojiById'])
        const { getGuild } = await getModule(['getGuild'])
        const Tooltip = await getModuleByDisplayName('Tooltip')

        inject('better-emoji-tooltips', Tooltip.prototype, 'show', function () {
            try {
                if (this.props.text.startsWith &&
                    this.props.text.startsWith(':') &&
                    this.props.text.endsWith(':')) {
                        let emoji = this.props.children(this), emoji2
                        if (emoji.type.displayName == 'EmojiButton') {
                            emoji2 = emoji.props.emoji
                            const { type } = emoji
                            emoji.type = e => {
                                const { props: { children } } = type(e)
                                children.props.className = 'emoji jumboable'
                                return children
                            }
                        } else if (emoji.type.displayName == 'Clickable') {
                            emoji = emoji.props.children[0]
                            emoji.props.className = 'emoji jumboable'
                            if (emoji.props.src.startsWith('https'))
                                emoji.props.emojiId = emoji.props.src.split('/')[4].split('.')[0]
                        } else emoji.props.jumboable = true

                        this.props.text = React.createElement('div', {
                            className: 'emoji-tooltip', style: { '--bet-size': _this.settings.get('size', 80) + 'px' }
                        }, emoji, React.createElement('br'), this.props.text)

                        if (!_this.settings.get('serverName', true)) return
                        if (!emoji2) emoji2 = getCustomEmojiById(emoji.props.emojiId)
                        if (!emoji2) return
                        const server = getGuild(emoji2.guildId)
                        if (!server) return

                        this.props.text.props.children.push(React.createElement('br'), 'Server: ' + server.name)
                }
            } catch (e) {
                console.error(e)
            }
        })
    }

    pluginWillUnload() {
        uninject('better-emoji-tooltips')
    }
}
