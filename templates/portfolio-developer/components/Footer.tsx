interface FooterProps {
    email: string;
    name: string;
}

const Footer = ({ email, name }: FooterProps) => {
    return (
        <footer className="text-center pb-5" id="contact">
            <div className="container">
                <p className="text-lg">Have a project in mind?</p>
                <a
                    href={`mailto:${email}`}
                    className="text-3xl sm:text-4xl font-anton inline-block mt-5 mb-10 hover:underline"
                >
                    {email}
                </a>

                <div className="">
                    <p className="text-muted-foreground">
                        {name}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
