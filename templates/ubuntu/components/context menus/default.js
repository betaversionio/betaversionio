import React from 'react'
import { usePortfolio } from '../../lib/portfolio-context';

function DefaultMenu(props) {
    const { data } = usePortfolio();

    const socialLinks = data?.user?.socialLinks || [];
    const linkedIn = socialLinks.find(l => l.platform.toLowerCase() === 'linkedin');
    const github = socialLinks.find(l => l.platform.toLowerCase() === 'github');
    const email = data?.user?.email;

    return (
        <div id="default-menu" className={(props.active ? " block " : " hidden ") + " cursor-default w-52 context-menu-bg border text-left border-gray-900 rounded text-white py-4 absolute z-50 text-sm"}>
            {linkedIn && (
                <a rel="noreferrer noopener" href={linkedIn.url} target="_blank" className="w-full block cursor-default py-0.5 hover:bg-ub-warm-grey hover:bg-opacity-20 mb-1.5">
                    <span className="ml-5">🙋‍♂️</span> <span className="ml-2">Follow on <strong>Linkedin</strong></span>
                </a>
            )}
            {github && (
                <a rel="noreferrer noopener" href={github.url} target="_blank" className="w-full block cursor-default py-0.5 hover:bg-ub-warm-grey hover:bg-opacity-20 mb-1.5">
                    <span className="ml-5">🤝</span> <span className="ml-2">Follow on <strong>Github</strong></span>
                </a>
            )}
            {email && (
                <a rel="noreferrer noopener" href={`mailto:${email}`} target="_blank" className="w-full block cursor-default py-0.5 hover:bg-ub-warm-grey hover:bg-opacity-20 mb-1.5">
                    <span className="ml-5">📥</span> <span className="ml-2">Contact Me</span>
                </a>
            )}
            <Devider />
            <div onClick={() => { localStorage.clear(); window.location.reload() }} className="w-full block cursor-default py-0.5 hover:bg-ub-warm-grey hover:bg-opacity-20 mb-1.5">
                <span className="ml-5">🧹</span> <span className="ml-2">Reset Ubuntu</span>
            </div>
        </div>
    )
}

function Devider() {
    return (
        <div className="flex justify-center w-full">
            <div className=" border-t border-gray-900 py-1 w-2/5"></div>
        </div>
    );
}

export default DefaultMenu
