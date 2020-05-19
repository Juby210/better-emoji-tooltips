const { resolve } = require('path')
const { Plugin } = require('powercord/entities')
const { getModule, getModuleByDisplayName, React } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')

const Settings = require('./Settings')

module.exports = class BetterEmojiTooltips extends Plugin {
    async startPlugin() {
        this.registerSettings('better-emoji-tooltips', 'Better Emoji Tooltips', Settings)
        this.loadCSS(resolve(__dirname, 'style.css'))

        const { getCustomEmojiById } = await getModule(['getCustomEmojiById'])
        const { getGuild } = await getModule(['getGuild'])
        const Tooltip = await getModuleByDisplayName('Tooltip')

        inject('better-emoji-tooltips', Tooltip.prototype, 'renderTooltip', (_, res) => {
            if (!res.props.targetElementRef || !res.props.targetElementRef.current || !res.props.children.split)
                return res
            const s = res.props.children.split(' ').pop()
            if (!s.startsWith(':') || !s.endsWith(':')) return res

            try {
                let src
                const { current } = res.props.targetElementRef
                const img = current.querySelector('img')
                if (current.className.startsWith('emoji')) src = current.src
                else if (img && (img.className.startsWith('emoji') || img.className.startsWith('icon-')))
                src = img.src; else return res

                res.props.children = React.createElement('div', {
                    className: 'emoji-tooltip', style: { '--bet-size': this.settings.get('size', 80) + 'px' }
                }, React.createElement('img', { className: 'emoji jumboable', src }),
                React.createElement('br'), res.props.children)

                if (!this.settings.get('serverName', true) || !src.startsWith('https://cdn.discord')) return res
                const id = src.split('/')[4].split('.')[0]
                const emoji = getCustomEmojiById(id)
                if (!emoji) return res
                const server = getGuild(emoji.guildId)
                if (!server) return res

                res.props.children.props.children.push(React.createElement('br'), 'Server: ' + server.name)
            } catch (e) {
                console.error(e, res)
            }

            return res
        })
    }

    pluginWillUnload() {
        uninject('better-emoji-tooltips')
    }
}
