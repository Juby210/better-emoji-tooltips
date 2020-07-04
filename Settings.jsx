const { React } = require('powercord/webpack')
const { SliderInput, SwitchItem } = require('powercord/components/settings')

module.exports = class Settings extends React.Component {
    render() {
        return <>
            <SwitchItem
                value={ this.props.getSetting('serverName', true) }
                onChange={ () => this.props.toggleSetting('serverName', true) }
                note='This will only work if you are on a server with tooltip emoji'
            >Show server name in emoji tooltip</SwitchItem>
            <SliderInput
                minValue={ 10 }
                maxValue={ 150 }
                initialValue={ this.props.getSetting('size', 80) }
                markers={[ 10, 25, 50, 75, 100, 125, 150 ]}
                className='better-emoji-tooltips-slider'
                onValueChange={ v => this.props.updateSetting('size', Math.round(v)) }
                onValueRender={ v => <span>{Math.round(v)} px</span> }
            >Emoji size</SliderInput>
        </>
    }
}
