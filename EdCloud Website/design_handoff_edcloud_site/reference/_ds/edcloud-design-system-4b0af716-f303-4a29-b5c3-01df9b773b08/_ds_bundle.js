/* @ds-bundle: {"format":4,"namespace":"EdCloudDesignSystem_4b0af7","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"CapabilityList","sourcePath":"components/marketing/CapabilityList.jsx"},{"name":"CaseCard","sourcePath":"components/marketing/CaseCard.jsx"},{"name":"Hero","sourcePath":"components/marketing/Hero.jsx"},{"name":"LogoWall","sourcePath":"components/marketing/LogoWall.jsx"},{"name":"PressRow","sourcePath":"components/marketing/PressRow.jsx"},{"name":"SectionHead","sourcePath":"components/marketing/SectionHead.jsx"},{"name":"ServiceCard","sourcePath":"components/marketing/ServiceCard.jsx"},{"name":"Stat","sourcePath":"components/marketing/Stat.jsx"},{"name":"StatRow","sourcePath":"components/marketing/Stat.jsx"},{"name":"Footer","sourcePath":"components/navigation/Footer.jsx"},{"name":"NavBar","sourcePath":"components/navigation/NavBar.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"1249798a7a22","components/forms/Checkbox.jsx":"26c4d74c3a9b","components/forms/Input.jsx":"90650b9d4ccf","components/marketing/CapabilityList.jsx":"162033350a62","components/marketing/CaseCard.jsx":"16fbbe6b808e","components/marketing/Hero.jsx":"0c4d1f83f810","components/marketing/LogoWall.jsx":"5f2bebb5b394","components/marketing/PressRow.jsx":"e8d9651ae49f","components/marketing/SectionHead.jsx":"9879d2d072cc","components/marketing/ServiceCard.jsx":"df0cd46a8ee6","components/marketing/Stat.jsx":"3d71a506e99d","components/navigation/Footer.jsx":"b3206877dc9e","components/navigation/NavBar.jsx":"f572e7d4c7b5","ui_kits/website/About.jsx":"5aaafc977c36","ui_kits/website/Home.jsx":"b79c4c6dd480"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.EdCloudDesignSystem_4b0af7 = window.EdCloudDesignSystem_4b0af7 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Button.jsx
try { (() => {
const styleByVariant = {
  primary: {
    background: 'var(--ink)',
    color: 'var(--white)',
    border: '1.5px solid var(--ink)'
  },
  secondary: {
    background: 'transparent',
    color: 'var(--ink)',
    border: '1.5px solid var(--ink)'
  },
  link: {
    background: 'none',
    color: 'var(--ink)',
    border: '0',
    padding: 0,
    borderRadius: 0,
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
    letterSpacing: 0
  }
};
const hoverByVariant = {
  primary: {
    background: 'var(--signal-ink)',
    borderColor: 'var(--signal-ink)'
  },
  secondary: {
    background: 'var(--ink)',
    color: 'var(--white)'
  },
  link: {
    color: 'var(--signal-ink)'
  }
};
function Button({
  variant = 'primary',
  href,
  disabled,
  onClick,
  children,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--s-2)',
    fontFamily: 'var(--font)',
    fontWeight: 600,
    fontSize: 'var(--t-small)',
    letterSpacing: '.02em',
    padding: '14px 26px',
    borderRadius: 'var(--radius-pill)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    transition: 'background var(--dur) var(--ease),color var(--dur) var(--ease)',
    opacity: disabled ? 0.45 : 1
  };
  const s = {
    ...base,
    ...styleByVariant[variant],
    ...(hover && !disabled ? hoverByVariant[variant] : {}),
    ...style
  };
  const Tag = href ? 'a' : 'button';
  return /*#__PURE__*/React.createElement(Tag, {
    href: href,
    disabled: disabled,
    onClick: onClick,
    style: s,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  label,
  id,
  checked,
  defaultChecked,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: 'flex',
      gap: 'var(--s-2)',
      alignItems: 'flex-start',
      fontSize: 'var(--t-small)',
      color: 'var(--ink-2)',
      fontFamily: 'var(--font)',
      cursor: 'pointer',
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    id: id,
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    style: {
      marginTop: 4,
      accentColor: 'var(--signal)'
    }
  }), /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  id,
  type = 'text',
  multiline,
  rows = 4,
  optional,
  error,
  value,
  defaultValue,
  onChange,
  placeholder,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  const field = {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'var(--font)',
    fontSize: 'var(--t-body)',
    lineHeight: 'var(--lh-body)',
    padding: '12px 14px',
    border: `1px solid ${error ? 'var(--error)' : focus ? 'var(--signal)' : 'var(--line)'}`,
    outline: focus ? '2px solid var(--signal)' : 'none',
    background: 'var(--white)',
    color: 'var(--ink)',
    borderRadius: 0
  };
  const shared = {
    id,
    value,
    defaultValue,
    onChange,
    placeholder,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: field
  };
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: 'block',
      fontSize: 'var(--t-small)',
      color: 'var(--ink)',
      marginBottom: 'var(--s-1)'
    }
  }, label, optional && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--slate)'
    }
  }, " (optional)")), multiline ? /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows
  }, shared)) : /*#__PURE__*/React.createElement("input", _extends({
    type: type
  }, shared)), error && /*#__PURE__*/React.createElement("small", {
    style: {
      color: 'var(--error)',
      fontSize: '0.8125rem'
    }
  }, error));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/marketing/CapabilityList.jsx
try { (() => {
function CapabilityList({
  items = []
}) {
  return /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      borderTop: '1px solid var(--line)',
      fontFamily: 'var(--font)'
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: 'var(--counter-col) 1fr',
      gap: 'var(--s-4)',
      padding: 'var(--s-4) 0',
      borderBottom: '1px solid var(--line)',
      color: 'var(--ink)',
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--t-index)',
      color: 'var(--slate)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, String(i + 1).padStart(2, '0')), it)));
}
Object.assign(__ds_scope, { CapabilityList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketing/CapabilityList.jsx", error: String((e && e.message) || e) }); }

// components/marketing/CaseCard.jsx
try { (() => {
function CaseCard({
  index,
  title,
  children,
  result,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--white)',
      border: '1px solid var(--line)',
      borderTop: '2px solid var(--ink)',
      padding: 'var(--s-5)',
      fontFamily: 'var(--font)',
      ...style
    }
  }, index && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginBottom: 'var(--s-3)',
      fontSize: 'var(--t-index)',
      color: 'var(--slate)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, index), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--t-h3)',
      lineHeight: 'var(--lh-snug)',
      color: 'var(--ink)',
      fontWeight: 600,
      margin: '0 0 var(--s-2)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--t-small)',
      color: 'var(--ink-2)',
      lineHeight: 'var(--lh-body)'
    }
  }, children), result && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 'var(--s-3)',
      color: 'var(--growth)',
      fontWeight: 600,
      fontSize: 'var(--t-small)'
    }
  }, result));
}
Object.assign(__ds_scope, { CaseCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketing/CaseCard.jsx", error: String((e && e.message) || e) }); }

// components/marketing/Hero.jsx
try { (() => {
function Hero({
  title,
  lead,
  primary,
  primaryHref = '#',
  onPrimary,
  link,
  linkHref = '#',
  onLink
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--white)',
      border: '1px solid var(--line)',
      padding: 'var(--s-8) var(--s-6)',
      fontFamily: 'var(--font)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--t-display)',
      lineHeight: 'var(--lh-tight)',
      letterSpacing: 'var(--track-display)',
      color: 'var(--ink)',
      fontWeight: 600,
      maxWidth: '14ch',
      margin: '0 0 var(--s-5)'
    }
  }, title), lead && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '1.125rem',
      maxWidth: '56ch',
      color: 'var(--ink-2)',
      margin: '0 0 var(--s-5)',
      lineHeight: 'var(--lh-body)'
    }
  }, lead), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--s-4)',
      alignItems: 'center'
    }
  }, primary && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    href: primaryHref,
    onClick: onPrimary
  }, primary), link && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "link",
    href: linkHref,
    onClick: onLink
  }, link)));
}
Object.assign(__ds_scope, { Hero });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketing/Hero.jsx", error: String((e && e.message) || e) }); }

// components/marketing/LogoWall.jsx
try { (() => {
function LogoWall({
  names = [],
  columns = 6
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns},1fr)`,
      gap: 1,
      background: 'var(--line)',
      border: '1px solid var(--line)'
    }
  }, names.map((n, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: 'var(--paper-2)',
      height: 88,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--ink)',
      opacity: .6,
      fontWeight: 500,
      fontSize: 'var(--t-small)',
      fontFamily: 'var(--font)'
    }
  }, n)));
}
Object.assign(__ds_scope, { LogoWall });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketing/LogoWall.jsx", error: String((e && e.message) || e) }); }

// components/marketing/PressRow.jsx
try { (() => {
function PressRow({
  items = []
}) {
  return /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      borderTop: '1px solid var(--line)',
      fontFamily: 'var(--font)'
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '200px 1fr auto',
      gap: 'var(--s-4)',
      alignItems: 'baseline',
      padding: 'var(--s-4) 0',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--t-small)',
      color: 'var(--slate)'
    }
  }, it.source), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink)',
      fontWeight: 500
    }
  }, it.title), /*#__PURE__*/React.createElement("a", {
    href: it.href || '#',
    style: {
      color: 'var(--signal)',
      textUnderlineOffset: 3,
      fontSize: 'var(--t-body)'
    }
  }, "Read the article"))));
}
Object.assign(__ds_scope, { PressRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketing/PressRow.jsx", error: String((e && e.message) || e) }); }

// components/marketing/SectionHead.jsx
try { (() => {
function SectionHead({
  index,
  title,
  sub,
  style
}) {
  const T = sub ? 'h3' : 'h2';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'var(--counter-col) 1fr',
      alignItems: 'baseline',
      gap: 'var(--s-4)',
      fontFamily: 'var(--font)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: sub ? 'var(--t-small)' : 'var(--t-index)',
      color: 'var(--slate)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, index), /*#__PURE__*/React.createElement(T, {
    style: {
      margin: 0,
      fontSize: sub ? 'var(--t-h3)' : 'var(--t-h2)',
      lineHeight: 'var(--lh-snug)',
      color: 'var(--ink)',
      fontWeight: 600
    }
  }, title));
}
Object.assign(__ds_scope, { SectionHead });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketing/SectionHead.jsx", error: String((e && e.message) || e) }); }

// components/marketing/ServiceCard.jsx
try { (() => {
function ServiceCard({
  index,
  title,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--white)',
      border: '1px solid var(--line)',
      padding: 'var(--s-5)',
      fontFamily: 'var(--font)',
      ...style
    }
  }, index && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginBottom: 'var(--s-3)',
      fontSize: 'var(--t-index)',
      color: 'var(--slate)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, index), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--t-h3)',
      lineHeight: 'var(--lh-snug)',
      color: 'var(--ink)',
      fontWeight: 600,
      margin: '0 0 var(--s-2)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--t-small)',
      color: 'var(--ink-2)',
      lineHeight: 'var(--lh-body)'
    }
  }, children));
}
Object.assign(__ds_scope, { ServiceCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketing/ServiceCard.jsx", error: String((e && e.message) || e) }); }

// components/marketing/Stat.jsx
try { (() => {
function Stat({
  value,
  label,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      display: 'block',
      fontSize: 'var(--t-stat)',
      lineHeight: 1,
      color: 'var(--ink)',
      fontWeight: 600,
      letterSpacing: 'var(--track-stat)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      color: 'var(--ink)',
      fontWeight: 500,
      margin: 'var(--s-2) 0 var(--s-1)'
    }
  }, label), children && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--t-small)',
      margin: 0,
      color: 'var(--ink-2)',
      lineHeight: 'var(--lh-body)'
    }
  }, children));
}
function StatRow({
  stats = [],
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(stats.length, 4) || 4},1fr)`,
      gap: 'var(--s-5)',
      ...style
    }
  }, stats.map((s, i) => /*#__PURE__*/React.createElement(Stat, {
    key: i,
    value: s.value,
    label: s.label
  }, s.detail)));
}
Object.assign(__ds_scope, { Stat, StatRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketing/Stat.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Footer.jsx
try { (() => {
function Footer({
  nav = [{
    label: 'About',
    href: '#'
  }, {
    label: 'Services & Results',
    href: '#'
  }, {
    label: 'Privacy policy',
    href: '#'
  }, {
    label: 'Accessibility statement',
    href: '#'
  }],
  follow = [{
    label: 'LinkedIn',
    href: '#'
  }, {
    label: 'X',
    href: '#'
  }]
}) {
  const h4 = {
    color: 'var(--white)',
    margin: '0 0 var(--s-3)',
    fontWeight: 600,
    fontSize: 'var(--t-body)'
  };
  const a = {
    color: 'var(--white)'
  };
  const ul = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gap: 'var(--s-2)'
  };
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--ink)',
      color: '#C8CDD5',
      padding: 'var(--s-7) var(--s-6)',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr',
      gap: 'var(--s-6)',
      fontSize: 'var(--t-small)',
      fontFamily: 'var(--font)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: h4
  }, "EdCloud Venture Partners"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 var(--s-4)'
    }
  }, "28 Geary St. Ste 650", /*#__PURE__*/React.createElement("br", null), "San Francisco, CA 94108", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("a", {
    style: a,
    href: "mailto:info@edcloud.org"
  }, "info@edcloud.org"), /*#__PURE__*/React.createElement("br", null), "510-306-2403"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0
    }
  }, "\xA9 2026 EdCloud Venture Partners")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: h4
  }, "Navigate"), /*#__PURE__*/React.createElement("ul", {
    style: ul
  }, nav.map((l, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("a", {
    style: a,
    href: l.href,
    onClick: l.onClick
  }, l.label))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: h4
  }, "Follow"), /*#__PURE__*/React.createElement("ul", {
    style: ul
  }, follow.map((l, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("a", {
    style: a,
    href: l.href
  }, l.label))))));
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Footer.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
function NavBar({
  links = [{
    label: 'About',
    href: '#'
  }, {
    label: 'Services & Results',
    href: '#'
  }, {
    label: 'Contact',
    href: '#'
  }],
  action = 'Book a meeting',
  actionHref = '#',
  onAction
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--s-5)',
      padding: 'var(--s-4) var(--s-5)',
      borderBottom: '1px solid var(--line)',
      background: 'var(--white)',
      fontFamily: 'var(--font)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-3)',
      color: 'var(--ink)',
      textDecoration: 'none',
      fontWeight: 600,
      fontSize: 'var(--t-small)',
      letterSpacing: 'var(--track-wordmark)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "aria-hidden": "true",
    style: {
      width: 22,
      height: 22,
      background: 'var(--ink)',
      display: 'inline-block'
    }
  }), "EDCLOUD VENTURE PARTNERS"), /*#__PURE__*/React.createElement("ul", {
    style: {
      display: 'flex',
      gap: 'var(--s-5)',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      fontSize: 'var(--t-small)'
    }
  }, links.map((l, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("a", {
    href: l.href,
    onClick: l.onClick,
    style: {
      color: 'var(--ink)',
      textDecoration: 'none'
    }
  }, l.label)))), action && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    href: actionHref,
    onClick: onAction
  }, action));
}
Object.assign(__ds_scope, { NavBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/About.jsx
try { (() => {
const DS2 = window.EdCloudDesignSystem_4b0af7;
const {
  SectionHead: SH,
  StatRow: SR,
  ServiceCard: SC
} = DS2;
function AboutScreen() {
  const wrap = window.edcloudWrap,
    sec = window.edcloudSec;
  return /*#__PURE__*/React.createElement("main", {
    style: wrap
  }, /*#__PURE__*/React.createElement("section", {
    style: sec
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--t-h1)',
      lineHeight: 'var(--lh-tight)',
      margin: '0 0 var(--s-6)'
    }
  }, "About Us"), /*#__PURE__*/React.createElement(SH, {
    index: "01",
    title: "Mission & History",
    style: {
      marginBottom: 'var(--s-6)'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: '62ch'
    }
  }, "EdCloud exists for a simple reason: too many promising education products stall out somewhere between \"brilliant pilot\" and \"truly transformational scale.\" We built EdCloud to be that force multiplier for early stage teams who are ready to make the leap."), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: '62ch'
    }
  }, "We partner with post-traction education technology companies (typically in the $0 to $1M ARR range) and help them reach $20M+ ARR faster and more predictably \u2014 without compromising product quality, student outcomes, or institutional trust."), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: '62ch',
      marginBottom: 0
    }
  }, "We operate with sleeves-rolled-up pragmatism. Yes, we craft strategy; more importantly, we turn that strategy into a working system your team can run. And, when you need it, we actually run the system.")), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--s-8) 0'
    }
  }, /*#__PURE__*/React.createElement(SH, {
    index: "02",
    title: "By The Numbers",
    style: {
      marginBottom: 'var(--s-6)'
    }
  }), /*#__PURE__*/React.createElement(SR, {
    stats: [{
      value: '20',
      label: 'Years of Experience',
      detail: 'A proven track record in education technology marketing and sales.'
    }, {
      value: '14',
      label: 'Ongoing Projects',
      detail: 'Actively engaged across diverse areas.'
    }, {
      value: '2',
      label: 'Provisional Patents',
      detail: 'For groundbreaking technological advancements.'
    }, {
      value: '8',
      label: 'Dedicated Professionals',
      detail: 'Passionate and skilled operators, experts, and engineers.'
    }]
  })));
}
function ServicesScreen() {
  const wrap = window.edcloudWrap;
  const caps = [['01', 'GTM Strategy & Positioning', 'Tight, buyer-centric narrative; ICP and segment strategy; value prop by persona.', '2 to 4 months'], ['02', 'Self-Perpetuating Sales Engine', 'Full-funnel K12 or Higher Ed system from lead gen to contract.', '6 to 12 months'], ['03', 'Competitive Pricing & Packaging', 'Monetization that matches value and procurement reality.', '3 to 6 months'], ['04', 'High-Yield Channel Partnerships', 'Platform integrations, resellers, and alliances that accelerate distribution.', '3 to 4 months'], ['05', 'Smarter Procurement Pathways', 'De-risked purchase paths for large districts and universities.', '3 to 4 months'], ['06', 'RevOps & Customer Outcomes', 'Integrated system for tracking outreach, engagement, renewals, and expansions.', '3 to 6 months']];
  return /*#__PURE__*/React.createElement("main", {
    style: wrap
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--s-8) 0'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--t-h1)',
      lineHeight: 'var(--lh-tight)',
      margin: '0 0 var(--s-6)'
    }
  }, "Services & Results"), /*#__PURE__*/React.createElement(SH, {
    index: "01",
    title: "Capabilities",
    style: {
      marginBottom: 'var(--s-6)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 'var(--s-5)'
    }
  }, caps.map(c => /*#__PURE__*/React.createElement(SC, {
    key: c[0],
    index: c[0],
    title: c[1]
  }, c[2], " Typical timeline: ", c[3], ".")))));
}
Object.assign(window, {
  AboutScreen,
  ServicesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/About.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Home.jsx
try { (() => {
const DS = window.EdCloudDesignSystem_4b0af7;
const {
  Hero,
  SectionHead,
  ServiceCard,
  CaseCard,
  CapabilityList,
  StatRow,
  PressRow,
  LogoWall,
  Button,
  Input,
  Checkbox
} = DS;
const wrap = {
  maxWidth: 'var(--max)',
  margin: '0 auto',
  padding: '0 var(--gutter)'
};
const sec = {
  padding: 'var(--s-8) 0',
  borderBottom: '1px solid var(--line)'
};
function HomeScreen() {
  return /*#__PURE__*/React.createElement("main", {
    style: wrap
  }, /*#__PURE__*/React.createElement("section", {
    style: sec
  }, /*#__PURE__*/React.createElement(Hero, {
    title: "We Bring Great Education Companies to National Scale.",
    lead: "EdCloud Venture Partners supercharges post-traction education technology teams that are actively reinventing instruction, administration, and the student experience.",
    primary: "Book a meeting",
    link: "See our results"
  })), /*#__PURE__*/React.createElement("section", {
    style: sec
  }, /*#__PURE__*/React.createElement(SectionHead, {
    index: "02",
    title: "Services & Results",
    style: {
      marginBottom: 'var(--s-6)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 'var(--s-5)'
    }
  }, /*#__PURE__*/React.createElement(ServiceCard, {
    index: "01",
    title: "Nationwide hypergrowth"
  }, "From a tiny foothold to omnipresence, plan and navigate your fastest path to national scale."), /*#__PURE__*/React.createElement(ServiceCard, {
    index: "02",
    title: "Ubiquitous market awareness"
  }, "Go from \"virtually unknown\" to \"virtually everywhere\" faster and more reliably than anybody else."), /*#__PURE__*/React.createElement(ServiceCard, {
    index: "03",
    title: "Supercharged product-market fit"
  }, "Focus on the parts of your product that resonate with K-12 and higher-ed decision makers."))), /*#__PURE__*/React.createElement("section", {
    style: sec
  }, /*#__PURE__*/React.createElement(SectionHead, {
    index: "03",
    title: "Featured Projects",
    style: {
      marginBottom: 'var(--s-6)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--s-5)'
    }
  }, /*#__PURE__*/React.createElement(CaseCard, {
    index: "01",
    title: "Join Handshake. 520 times.",
    result: "Last valued at $3.5B"
  }, "Expanded from 30 universities to over 550 \u2014 one of the fastest higher-education growth campaigns ever."), /*#__PURE__*/React.createElement(CaseCard, {
    index: "02",
    title: "Wayfinding from $0 to $15M ARR",
    result: "Used by over a million students"
  }, "We started working with Wayfinder when they were doing less than $50k in sales."), /*#__PURE__*/React.createElement(CaseCard, {
    index: "03",
    title: "Outschool, in demand.",
    result: "Valued at $3B"
  }, "Helped build the supply and demand engines behind the leading K-12 marketplace."), /*#__PURE__*/React.createElement(CaseCard, {
    index: "04",
    title: "Get Clever. To 90% market share.",
    result: "Acquired by Kahoot for $500M"
  }, "Built the K-12 sales and marketing teams from scratch; 10% to 90% share in under two years."))), /*#__PURE__*/React.createElement("section", {
    style: sec
  }, /*#__PURE__*/React.createElement(SectionHead, {
    index: "04",
    title: "Capabilities",
    style: {
      marginBottom: 'var(--s-6)'
    }
  }), /*#__PURE__*/React.createElement(CapabilityList, {
    items: ["Rapid product development and validation", "Sales, marketing, operations and customer success transformation", "Hypergrowth strategy, tactics and execution", "Competitive pricing and packaging", "High-yield channel partnerships", "RevOps and customer outcomes"]
  })), /*#__PURE__*/React.createElement("section", {
    style: sec
  }, /*#__PURE__*/React.createElement(SectionHead, {
    index: "05",
    title: "Press",
    style: {
      marginBottom: 'var(--s-6)'
    }
  }), /*#__PURE__*/React.createElement(PressRow, {
    items: [{
      source: 'Built in SF · Jan 2020',
      title: "Now valued at $3.5B, Handshake is poised to be Gen Z's LinkedIn"
    }, {
      source: 'Higher Ed Dive · May 2022',
      title: 'Zovio sells tutoring services business TutorMe for $55M'
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--s-6)'
    }
  }, /*#__PURE__*/React.createElement(LogoWall, {
    names: ["Handshake", "Clever", "Outschool", "Wayfinder", "LAUSD", "NYU"]
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--s-8) 0'
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    index: "06",
    title: "Contact",
    style: {
      marginBottom: 'var(--s-6)'
    }
  }), /*#__PURE__*/React.createElement(ContactForm, null)));
}
function ContactForm() {
  const [sent, setSent] = React.useState(false);
  if (sent) return /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--growth)',
      fontWeight: 600
    }
  }, "Thanks \u2014 we'll be in touch within one business day.");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--s-4)',
      maxWidth: 640
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "First name",
    id: "fn"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Last name",
    id: "ln"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    id: "em"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Phone",
    optional: true,
    id: "ph"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1/-1'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Message",
    multiline: true,
    rows: 4,
    id: "msg"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1/-1'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    id: "nl",
    label: "Yes, send me the newsletter."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1/-1'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => setSent(true)
  }, "Send message")));
}
Object.assign(window, {
  HomeScreen,
  ContactForm,
  edcloudWrap: wrap,
  edcloudSec: sec
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Home.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.CapabilityList = __ds_scope.CapabilityList;

__ds_ns.CaseCard = __ds_scope.CaseCard;

__ds_ns.Hero = __ds_scope.Hero;

__ds_ns.LogoWall = __ds_scope.LogoWall;

__ds_ns.PressRow = __ds_scope.PressRow;

__ds_ns.SectionHead = __ds_scope.SectionHead;

__ds_ns.ServiceCard = __ds_scope.ServiceCard;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.StatRow = __ds_scope.StatRow;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.NavBar = __ds_scope.NavBar;

})();
