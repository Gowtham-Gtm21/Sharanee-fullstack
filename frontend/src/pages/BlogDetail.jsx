import { Link, useParams } from "react-router-dom";
import { BLOGS } from "../data/blogData";
import { Icon } from "../components/Icons";

export default function BlogDetail() {
  const { slug } = useParams();
  const post = BLOGS.find((b) => b.slug === slug);
  if (!post) return <div className="empty"><h3>Article not found</h3><Link className="btn" to="/blog">Back to Blog</Link></div>;

  const more = BLOGS.filter((b) => b.slug !== slug).slice(0, 3);

  return (
    <div className="page-wrap">
      <div className="crumb"><div className="container"><Link to="/">Home</Link><span className="sep">›</span><Link to="/blog">Blog</Link><span className="sep">›</span>{post.category}</div></div>
      <article className="article">
        <div className="container article-head">
          <span className="eyebrow">{post.category}</span>
          <h1>{post.title}</h1>
          <small>{post.date} · {post.author}</small>
        </div>
        <div className="article-cover"><img src={post.cover} alt={post.title} /></div>
        <div className="article-body">
          {post.body.map((p, i) => <p key={i}>{p}</p>)}
          <Link to="/shop" className="btn btn-gold" style={{ marginTop: 20 }}>Shop the Collection <Icon.Arrow /></Link>
        </div>
      </article>

      <div className="container">
        <div className="section-head" style={{ marginTop: 30 }}><span className="eyebrow">Keep Reading</span><h2>More from the Journal</h2></div>
        <div className="blog-grid">
          {more.map((b) => (
            <Link to={`/blog/${b.slug}`} className="blog-card" key={b.slug}>
              <div className="blog-card-img"><img src={b.cover} alt={b.title} /></div>
              <div className="blog-card-body">
                <span className="pcard-cat">{b.category}</span>
                <h3>{b.title}</h3>
                <small>{b.date}</small>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
