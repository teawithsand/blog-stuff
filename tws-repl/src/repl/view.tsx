import { useState } from "react"

const ENTRIES_LENGTH_LIMIT = 5
const STRING_TRUNC_LIMIT = 50

const isValueUnfoldable = (value: any): boolean => {
	return (typeof value === "object" && value !== null) || (typeof value === "string" && value.length > STRING_TRUNC_LIMIT) || typeof value === "function"
}

const sanitizeString = (value: string, allowTruncation: boolean): string => {
	if (allowTruncation && value.length > STRING_TRUNC_LIMIT) {
		value = value.slice(0, STRING_TRUNC_LIMIT)
		value += "…"
	}
	return JSON.stringify(value)
}

const getObjectName = (a: any): string => {
	if (isObjectArray(a)) {
		return `Array(${a.length})`
	}

	if (
		a !== null &&
		typeof a === "object") {
		return a.constructor.name
	}
	return "Object"
}

const getObjectEntries = (a: any): [string, any][] => {
	const names = Object.getOwnPropertyNames(a)
	return names.map(n => [n, a[n]])
}


const isObjectArray = (a: any): boolean => {
	return a instanceof Array
}

const FoldedValueView = (props: {
	value: any
}) => {
	const { value } = props
	const typeofValue = typeof value

	if (typeofValue === "object") {
		if (value === null) {
			return <span className="c-val-expl__null">null</span>
		}
		if (value instanceof Array) {
			if (value.length === 0) {
				return <span className="c-val-expl__f-object">{"["}{"]"}</span>
			} else {
				return <span className="c-val-expl__f-object">{"["}…{"]"}</span>
			}
		} else {
			return <span className="c-val-expl__f-object">{"{"}…{"}"}</span>
		}
	} else if (typeofValue === "number") {
		return <span className="c-val-expl__number">{value}</span>
	} else if (typeofValue === "bigint") {
		return <span className="c-val-expl__bigint">{value.toString()}n</span>
	} else if (typeofValue === "string") {
		return <span className="c-val-expl__string">
			{sanitizeString(value, true)}
		</span>
	} else if (typeofValue === "undefined") {
		return <span className="c-val-expl__undefined">undefined</span>
	} else if (typeofValue === "boolean") {
		return <span className="c-val-expl__boolean">{value ? "true" : "false"}</span>
	} else if (typeofValue === "function") {
		return <span className="c-val-expl__function">function {value.name}()</span>
	} else if (typeofValue === "symbol") {
		return <span className="c-val-expl__symbol">{value.toString()}</span>
	} else {
		return <span className="c-val-expl__else">{value.toString()}</span>
	}
}

const LongStringView = (props: {
	value: string
}) => {
	return <span className="c-val-expl__string">
		{sanitizeString(props.value, false)}
	</span>
}

const FunctionView = (props: {
	value: Function
}) => {
	return <span className="c-val-expl__function-code">
		<pre><code>{props.value.toString()}</code></pre>
	</span>
}

const Header = (props: {
	value: any
}) => {
	const { value } = props
	const typeofValue = typeof value

	if (typeofValue === "object") {
		if (value === null) {
			return <FoldedValueView value={value} />
		}
		const entries = getObjectEntries(value)

		return <div className="c-val-expl__f-obj-wrapper">
			<div className="c-val-expl__f-obj-name">{getObjectName(value)}</div>
			<div className="c-val-expl__f-paren-open">{"{"}</div>
			<ul className="c-val-expl__f-obj-content">
				{entries.slice(0, ENTRIES_LENGTH_LIMIT).map(
					([k, v], i) => <li key={k} className="c-val-expl__f-obj-tuple">
						<div className="c-val-expl__f-obj-key">
							{k}:
						</div>
						<div className="c-val-expl__f-obj-value">
							<FoldedValueView value={v} />{
								i < Math.min(ENTRIES_LENGTH_LIMIT - 1, entries.length - 1) ? "," : ""
							}
						</div>
					</li>
				)}
				{entries.length > ENTRIES_LENGTH_LIMIT ? <div className="c-val-expl__f-more">, …</div> : null}
			</ul>
			<div className="c-val-expl__f-paren-close">{"}"}</div>
		</div>
	} else {
		return <FoldedValueView value={value} />
	}
}

const Content = (props: {
	value: any,
}) => {
	const { value } = props
	const typeofValue = typeof value

	if (typeofValue === "object") {
		if (value === null) {
			return <FoldedValueView value={value} />
		}
		return <div className="c-val-expl__obj-wrapper">
			<ul className="c-val-expl__obj-content">
				{getObjectEntries(value).map(
					([k, v]) => <li key={k} className="c-val-expl__obj-tuple">
						<div className="c-val-expl__obj-key">
							{k}:
						</div>
						<div className="c-val-expl__obj-value">
							<InnerObjectView value={v} />
						</div>
					</li>
				)}
			</ul>
		</div>
	} else if (typeof value === "string") {
		return <LongStringView value={value} />
	} else if (typeof value === "function") {
		return <FunctionView value={value} />
	} else {
		return <FoldedValueView value={value} />
	}
}

export const ObjetView = ({ value }: { value: any }) => {
	return <InnerObjectView value={value} root={true} />
}

const InnerObjectView = (props: {
	value: any,
	root?: boolean
}) => {
	const { value, root } = props

	const [rawIsFoleded, setFolded] = useState(true)
	const isUnfoldable = isValueUnfoldable(value)

	const isFolded = rawIsFoleded // || isUnfoldable

	return <div className={`c-val-expl ${root ? "c-val-expl--root" : ""}`}>
		<div className="c-val-expl__header" onClick={() => {
			if (isUnfoldable) {
				setFolded(!isFolded)
			}
		}}>
			{isUnfoldable ? <div className="c-val-expl__fold-icon">{isFolded ? "▸" : "▾"}</div> : null}
			<Header value={value} />
		</div>
		{!isFolded ? <div className="c-val-expl__content">
			<Content value={value} />
		</div> : null}
	</div>
}