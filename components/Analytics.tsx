"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

/**
 * Vercel Web Analytics toujours chargé ; Beam seulement si son jeton est défini
 * (NEXT_PUBLIC_BEAM_TOKEN).
 */
export function Analytics() {
	const token = process.env.NEXT_PUBLIC_BEAM_TOKEN;
	return (
		<>
			{token && (
				<script
					src="https://beamanalytics.b-cdn.net/beam.min.js"
					data-token={token}
					async
				/>
			)}
			<VercelAnalytics />
		</>
	);
}
