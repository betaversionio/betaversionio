import { cn } from "@/lib/utils";
import { DecorIcon } from "@/components/ui/decor-icon";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import { QuoteDownIcon } from "@hugeicons/core-free-icons";

type Testimonial = {
	quote: string;
	name: string;
	role: string;
	company: string;
	image: string;
};

const testimonials: Testimonial[] = [
	{
		quote:
			"I used to juggle a GitHub profile, a portfolio site, LinkedIn, and a PDF resume. DevCom replaced all of that with one link.",
		image: "https://i.pravatar.cc/150?u=priya",
		name: "Priya Sharma",
		role: "Full Stack Developer",
		company: "Freelance",
	},
	{
		quote:
			"The resume builder alone is worth it. I edit once, and my hosted PDF updates everywhere I've shared it. Recruiters love it.",
		image: "https://i.pravatar.cc/150?u=alex",
		name: "Alex Chen",
		role: "Senior SWE",
		company: "Stripe",
	},
	{
		quote:
			"Finally a feed that's actually for developers. No hustle culture posts, no motivational fluff. Just code, ideas, and real discussions.",
		image: "https://i.pravatar.cc/150?u=maria",
		name: "Maria Rodriguez",
		role: "Backend Engineer",
		company: "Vercel",
	},
];

export function TestimonialsSection() {
	return (
		<div className="mx-auto grid w-full max-w-5xl gap-8 px-4 md:grid-cols-3 md:gap-6 md:px-8">
			{testimonials.map((testimonial, index) => (
				<TestimonialCard
					index={index}
					key={testimonial.name}
					testimonial={testimonial}
				/>
			))}
		</div>
	);
}

function TestimonialCard({
	testimonial,
	index,
	className,
	...props
}: React.ComponentProps<"figure"> & {
	testimonial: Testimonial;
	index: number;
}) {
	const { quote, name, role, company, image } = testimonial;

	return (
		<figure
			className={cn(
				"relative flex flex-col justify-between gap-6 px-8 pt-8 pb-6 shadow-sm md:translate-y-[calc(3rem*var(--t-card-index))]",
				className
			)}
			style={
				{
					"--t-card-index": index,
				} as React.CSSProperties
			}
			{...props}
		>
			{/* Dark mode radial gradient */}
			<div
				className="pointer-events-none absolute inset-0 hidden dark:block"
				style={{
					background:
						"radial-gradient(50% 80% at 25% 0%, hsl(var(--foreground) / 0.1), transparent)",
				}}
			/>

			<div className="absolute -inset-y-4 -left-px w-px bg-border" />
			<div className="absolute -inset-y-4 -right-px w-px bg-border" />
			<div className="absolute -inset-x-4 -top-px h-px bg-border" />
			<div className="absolute -right-4 -bottom-px -left-4 h-px bg-border" />
			<DecorIcon className="size-3.5" position="top-left" />

			<blockquote className="flex gap-4">
				<HugeiconsIcon
					icon={QuoteDownIcon}
					aria-hidden="true"
					className="size-6 shrink-0 stroke-1"
				/>

				<p className="flex-1 text-base font-normal leading-relaxed text-muted-foreground">
					{quote}
				</p>
			</blockquote>

			<figcaption className="flex items-center gap-3">
				<Avatar className="size-10 rounded-full ring-2 ring-border ring-offset-2 ring-offset-background">
					<AvatarImage alt={`${name}'s profile picture`} src={image} />
					<AvatarFallback>{name.charAt(0)}</AvatarFallback>
				</Avatar>
				<div className="flex flex-col">
					<cite className="text-sm font-medium not-italic text-foreground">
						{name}
					</cite>
					<p className="text-xs text-muted-foreground">
						{role}, <span className="text-foreground/80">{company}</span>
					</p>
				</div>
			</figcaption>
		</figure>
	);
}
