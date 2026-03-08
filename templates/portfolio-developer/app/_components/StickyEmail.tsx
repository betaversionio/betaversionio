interface StickyEmailProps {
    email: string;
}

const StickyEmail = ({ email }: StickyEmailProps) => {
    return (
        <div className="max-xl:hidden fixed bottom-32 left-0 block">
            <a
                href={`mailto:${email}`}
                className="px-3 text-muted-foreground tracking-[1px] transition-all !bg-bottom hover:text-foreground hover:!bg-center"
                style={{
                    textOrientation: 'mixed',
                    writingMode: 'vertical-rl',
                }}
            >
                {email}
            </a>
        </div>
    );
};

export default StickyEmail;
