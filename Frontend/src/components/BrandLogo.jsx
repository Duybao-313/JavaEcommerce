import React from 'react'
import { Link } from 'react-router-dom'

function BrandLogo({ to = '/', subtitle = '' }) {
  return (
	<Link to={to} className="inline-flex items-center gap-2">
	  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-sm">
		SG
	  </span>
	  <span className="flex flex-col leading-none">
		<span className="text-xl font-semibold tracking-tight text-zinc-900">SplitGo</span>
		{subtitle ? <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{subtitle}</span> : null}
	  </span>
	</Link>
  )
}

export default BrandLogo
