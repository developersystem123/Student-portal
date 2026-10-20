// One star row for the whole site.
//
// The template dresses a static five-star list as a fixed "three filled" decoration —
// `.courses-one__ratting li:nth-child(4) span, li:nth-child(5) span { color: var(--site-gray) }`
// in the generated bundle — so a 5.0 course showed three gold stars and a 3.0 course showed three
// as well. Here each star gets a grey base with a gold copy clipped to the real fraction, so 4.8
// reads as four and four fifths. The row keeps the template's own class names so its spacing and
// the surrounding markup are untouched.

export default function StarRating({
  rating,
  className = "",
  label,
}: {
  rating: number;
  className?: string;
  label?: string;
}) {
  return (
    <ul className={`${className} edu-star-row list-unstyled`} aria-label={label ?? `${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <li key={index}>
          <span className="icon-star edu-star__base" aria-hidden="true">
            <span
              className="icon-star edu-star__fill"
              style={{ width: `${Math.round(Math.max(0, Math.min(1, rating - index)) * 100)}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
