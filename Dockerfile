# syntax=docker/dockerfile:1
# Prebuilt Vite dist is uploaded in the drop ZIP (faster/reliable for Dokploy).

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
