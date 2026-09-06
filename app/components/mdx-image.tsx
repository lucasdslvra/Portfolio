"use client";

import * as React from "react";
import { createPortal } from "react-dom";

function clsx(...args: any[]) {
	return args.filter(Boolean).join(" ");
}

type Props = React.ImgHTMLAttributes<HTMLImageElement>;

export function MdxImage({ className, alt, src, ...props }: Props) {
	const [open, setOpen] = React.useState(false);

	React.useEffect(() => {
		if (!open) {
			return;
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
			}
		};

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [open]);

	return (
		<>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				className={clsx(
					"rounded-md border border-zinc-200 cursor-zoom-in transition hover:opacity-90",
					className,
				)}
				alt={alt}
				src={src}
				onClick={() => setOpen(true)}
				{...props}
			/>

			{open &&
				createPortal(
					<div
						role="dialog"
						aria-modal="true"
						aria-label={alt || "Image agrandie"}
						onClick={() => setOpen(false)}
						className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 cursor-zoom-out bg-zinc-950/70 backdrop-blur-md"
					>
						<button
							type="button"
							aria-label="Fermer"
							onClick={() => setOpen(false)}
							className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/60 text-2xl leading-none text-zinc-100 transition hover:bg-zinc-900/90"
						>
							&times;
						</button>

						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={src}
							alt={alt}
							onClick={(event) => event.stopPropagation()}
							className="max-h-full max-w-full cursor-default rounded-lg object-contain shadow-2xl"
						/>
					</div>,
					document.body,
				)}
		</>
	);
}
