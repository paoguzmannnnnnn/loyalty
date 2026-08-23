import { theme } from './theme';

export function Brand() {
    return (
        <div className="brand">
        <div className="brand__logo">{theme.logo}</div>
        <p className="brand__name">{theme.brandName}</p>
        </div>
    );
}