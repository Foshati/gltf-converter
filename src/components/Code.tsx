import { Highlight, themes } from 'prism-react-renderer'

interface CodeProps {
  children: string
}

const Code: React.FC<CodeProps> = ({ children }) => {
  return (
    <Highlight theme={themes.nightOwlLight} code={children} language="jsx">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} whitespace-pre-wrap col-span-3 p-16 overflow-auto bg-white h-full`}
          style={{
            ...style,
            fontSize: 12,
          }}>
          {tokens.map((line, i) => {
            const { key, ...lineProps } = getLineProps({ line, key: i })
            return (
              <div key={i} {...lineProps}>
                {line.map((token, tokenKey) => {
                  const { key: tokenPropKey, ...tokenProps } = getTokenProps({ token, key: tokenKey })
                  return <span key={tokenKey} {...tokenProps} />
                })}
              </div>
            )
          })}
        </pre>
      )}
    </Highlight>
  )
}

export default Code