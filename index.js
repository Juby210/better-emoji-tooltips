const { Plugin } = require('powercord/entities')
const { getModule, getModuleByDisplayName, React } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')

const Settings = require('./Settings')

module.exports = class BetterEmojiTooltips extends Plugin {
    async startPlugin() {
        this.loadStylesheet('style.css')
        powercord.api.settings.registerSettings(this.entityID, {
            category: this.entityID,
            label: 'Better Emoji Tooltips',
            render: Settings
        })

        const _this = this
        const { getCustomEmojiById } = await getModule(['getCustomEmojiById'])
        const { getGuild } = await getModule(['getGuild'])
        const Tooltip = await getModuleByDisplayName('Tooltip')

        inject('better-emoji-tooltips', Tooltip.prototype, 'renderTooltip', function (_, res) {
            if (!res.props.targetElementRef ||
                !res.props.targetElementRef.current ||
                (!res.props.children.split && (!this.props['aria-label'] || !this.props['aria-label'].split))
            ) return res
            const s = res.props.children.split ? res.props.children.split(' ').pop() : this.props['aria-label']
            if (!s.startsWith(':') || !s.endsWith(':')) return res

            try {
                let src
                const { current } = res.props.targetElementRef
                const img = current.querySelector('img')
                if (current.tagName != 'SPAN' && current.className.startsWith('emoji')) src = current.src
                else if (img && (img.className.startsWith('emoji') || img.className.startsWith('icon-')))
                src = img.src; else return res

                const newTooltip = res.props.children.props && !!res.props.children.props.children
                res.props.children = React.createElement('div', {
                    className: 'emoji-tooltip', style: { '--bet-size': _this.settings.get('size', 80) + 'px' }
                }, React.createElement('img', { className: 'emoji jumboable', src }),
                React.createElement('br'), newTooltip ? res.props.children.props.children[0].props.children : res.props.children)

                if (!_this.settings.get('serverName', true) || !src.startsWith('https://cdn.discord')) return res
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
        powercord.api.settings.unregisterSettings(this.entityID)
        uninject('better-emoji-tooltips')
    }
}
