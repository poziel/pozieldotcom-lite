# 🌐 Poziel Landing Pages

Beautiful, domain-aware landing pages for `poziel.com`, `poziel.dev`, `poziel.tv`, and `poziel.gg`.

## ✨ Features

- **Domain-aware routing**: Automatically shows different content based on the domain
- **Responsive design**: Looks great on all devices
- **Beautiful animations**: Smooth fade-in effects and hover interactions
- **Easy customization**: Single config file (`config.js`) for all content
- **Docker-ready**: Simple deployment with Docker Compose
- **Traefik labels included**: Plug-and-play with your reverse proxy
- **Laravel-ready**: Easy migration path to Laravel in the future

## 🚀 Quick Start

### 1. Clone or Create This Repo

```bash
# On your VPS
cd ~
git clone <your-repo-url> poziel-landing
cd poziel-landing
```

### 2. Customize Your Content

Edit `public/config.js` and update:
- Social links
- Handles
- Taglines
- Icons (emoji or use Font Awesome later)

### 3. Deploy with Docker

```bash
# Build and start the container
docker-compose up -d

# View logs
docker logs -f poziel-landing
```

### 4. Configure NPM or Traefik

**Option A: Nginx Proxy Manager**

Create proxy hosts for each domain:
- **Domain**: `poziel.com` (and `www.poziel.com`)
- **Forward to**: `poziel-landing:80`
- **SSL**: Enable Let's Encrypt

Repeat for `poziel.dev`, `poziel.tv`, `poziel.gg`.

**Option B: Traefik** (if you switch later)

The `docker-compose.yml` already includes Traefik labels. Just ensure:
- The `proxy` network exists: `docker network create proxy`
- Traefik is configured with Let's Encrypt resolver

### 5. Update DNS

For each domain, create a CNAME record:

```
Type    Name    Target
CNAME   @       poziel.cloud
CNAME   www     poziel.cloud
```

## 📁 Project Structure

```
poziel-landing/
├── public/
│   ├── index.html          # Main landing page
│   ├── config.js           # Domain-specific content (EDIT THIS!)
│   └── assets/             # Optional: custom CSS, images
├── Dockerfile              # Container definition
├── docker-compose.yml      # Docker Compose config
├── nginx.conf              # Nginx web server config
└── README.md               # This file
```

## 🎨 Customization Guide

### Change Colors

Edit `index.html` around line 17-21 (Tailwind config):

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                'brand': {
                    50: '#f0f9ff',   // Light shade
                    500: '#0ea5e9',  // Main color
                    700: '#0369a1',  // Dark shade
                }
            }
        }
    }
}
```

Or update the gradient background class `.gradient-bg` (line 43-45):

```css
.gradient-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Change Icons

**Option 1: Keep Emojis** (current, simple)

Edit `config.js` and change the `icon` field to any emoji.

**Option 2: Use Font Awesome**

1. Add Font Awesome CDN to `index.html` (in `<head>`):
   ```html
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
   ```

2. In `config.js`, use Font Awesome classes:
   ```javascript
   icon: '<i class="fab fa-github"></i>'
   ```

### Add More Social Links

Edit `config.js` and add more objects to the `socials` array:

```javascript
{
    name: 'Mastodon',
    handle: '@poziel@mastodon.social',
    url: 'https://mastodon.social/@poziel',
    icon: '🐘'
}
```

### Change Fonts

Add Google Fonts to `index.html` (in `<head>`):

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
```

Then update the body font in Tailwind config:

```javascript
fontFamily: {
    sans: ['Inter', 'sans-serif']
}
```

## 🔄 Migration to Laravel (Future)

When you're ready to migrate to Laravel:

1. **Keep the frontend structure**:
   - Move `public/index.html` → Laravel's `resources/views/welcome.blade.php`
   - Move `public/config.js` → Laravel's `public/js/config.js` or load from API

2. **Update Docker setup**:
   - Replace Nginx with PHP-FPM + Nginx
   - Update Dockerfile to use Laravel base image
   - Keep the same `docker-compose.yml` network and labels

3. **Gradual migration**:
   - Start by serving static files from Laravel's `public/` directory
   - Add Laravel routes for dynamic features
   - Keep the domain-aware logic in JavaScript or move to Blade/controllers

## 🛠️ Maintenance

### Update Content

```bash
# On your VPS
cd ~/poziel-landing

# Edit config
nano public/config.js

# Rebuild and restart
docker-compose up -d --build
```

### View Logs

```bash
docker logs -f poziel-landing
```

### Stop/Restart

```bash
# Stop
docker-compose down

# Restart
docker-compose up -d
```

## ⚡ Performance Tips

- The Nginx config includes Gzip compression for faster loading
- Static assets are cached for 30 days
- Alpine Linux base image keeps container size small (~30 MB)

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker logs poziel-landing

# Verify ports aren't in use
sudo netstat -tulpn | grep 8081
```

### NPM shows 502 Bad Gateway

1. Verify container is on `proxy` network:
   ```bash
   docker network inspect proxy | grep poziel-landing
   ```

2. If missing, add it to `docker-compose.yml` and recreate:
   ```bash
   docker-compose down && docker-compose up -d
   ```

### Wrong domain content showing

- Check DNS propagation: `dig poziel.com`
- Clear browser cache or test in incognito
- Verify domain in `config.js` matches exactly (no `www.`)

## 📝 License

MIT License - Do whatever you want with this!

---

**Created by Poziel** | Last updated: October 2025