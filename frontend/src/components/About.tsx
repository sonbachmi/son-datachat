import Markdown from 'react-markdown'
import markdown from '@/about.md'

import './About.css'


function Media() {

    return <div className="About">
        <Markdown components={{
            // Rewrite `em`s (`*like so*`) to `i` with a red foreground color.
            a(props) {
                const {node, ...rest} = props
                return <a download {...rest} />
            }
        }}>
            {markdown}
        </Markdown>
    </div>
}

export default Media