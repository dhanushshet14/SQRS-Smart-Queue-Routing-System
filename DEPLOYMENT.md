# 🚀 Deployment Guide - AI Smart Queue Routing System

## Quick Start (Recommended for Demo)

### Option 1: Automated Demo Launcher
```bash
# Run the automated setup script
python start_demo.py
```

This script will:
- Check all dependencies
- Install backend and frontend packages
- Start both servers automatically
- Provide demo URLs and tips

### Option 2: Manual Setup
```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
python app.py

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

## 🐳 Docker Deployment (Production)

### Prerequisites
- Docker and Docker Compose installed
- 4GB+ RAM available
- Ports 80, 443, 3000, 8000 available

### Quick Deploy
```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Production Configuration
```bash
# For production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🧪 Testing & Validation

### Comprehensive System Test
```bash
# Run full system validation
python test_system.py
```

This will test:
- ✅ API endpoints functionality
- ✅ ML model accuracy and performance
- ✅ Database operations
- ✅ Real-time features
- ✅ Performance benchmarks
- ✅ Error handling

### Manual Testing Checklist
- [ ] Backend health check: `curl http://localhost:8000/health`
- [ ] Frontend loads without errors
- [ ] Auto-routing works with AI predictions
- [ ] Settings page shows live model metrics
- [ ] Reset queue generates new data
- [ ] All animations and 3D elements work

## 🌐 Environment Configuration

### Backend Environment Variables
```bash
# .env file in backend/
ENVIRONMENT=production
PYTHONPATH=/app
MODEL_PATH=./ml/transformer_enhanced_model.pkl
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Frontend Environment Variables
```bash
# .env file in frontend/
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=production
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

## 🔧 Performance Optimization

### Backend Optimization
- **Workers**: Use 4+ Uvicorn workers for production
- **Memory**: Allocate 2GB+ RAM for ML model
- **CPU**: 2+ cores recommended for concurrent requests
- **Caching**: Redis for session and prediction caching

### Frontend Optimization
- **Build**: Use `npm run build` for production
- **CDN**: Serve static assets from CDN
- **Compression**: Enable gzip in nginx
- **Caching**: Set proper cache headers

## 📊 Monitoring & Logging

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Model performance
curl http://localhost:8000/ai/model/performance

# System metrics
curl http://localhost:8000/analytics/performance
```

### Log Locations
- **Backend**: `backend/logs/app.log`
- **Frontend**: Browser console and network tab
- **Docker**: `docker-compose logs -f`

## 🔒 Security Configuration

### SSL/TLS Setup
```nginx
# nginx.conf for HTTPS
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://frontend:3000;
    }
    
    location /api/ {
        proxy_pass http://backend:8000/;
    }
}
```

### API Security
- CORS properly configured
- Input validation with Pydantic
- Rate limiting (implement with nginx)
- Authentication with Clerk

## 🚨 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.11+

# Check dependencies
pip install -r requirements.txt

# Check model files
ls -la backend/ml/*.pkl

# Check logs
tail -f backend/logs/app.log
```

#### Frontend Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+

# Build manually
npm run build
```

#### ML Model Issues
```bash
# Retrain model
cd backend
python ml/transformer_enhanced_trainer.py

# Check model files
ls -la ml/*.pkl

# Test predictions
python -c "from ml.routing_predictor import RoutingScorePredictor; p = RoutingScorePredictor(); print('Model loaded successfully')"
```

#### Performance Issues
- Check available RAM (model needs 1GB+)
- Monitor CPU usage during predictions
- Check network latency between services
- Verify database connection pooling

### Error Codes
- **500**: Internal server error (check logs)
- **404**: Endpoint not found (check API routes)
- **422**: Validation error (check request format)
- **503**: Service unavailable (check dependencies)

## 📈 Scaling Considerations

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  backend:
    deploy:
      replicas: 3
  
  frontend:
    deploy:
      replicas: 2
```

### Load Balancing
```nginx
# nginx load balancer
upstream backend_servers {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

upstream frontend_servers {
    server frontend1:3000;
    server frontend2:3000;
}
```

### Database Scaling
- Implement Redis for caching
- Use PostgreSQL for persistent data
- Consider read replicas for analytics

## 🎯 Production Checklist

### Pre-Deployment
- [ ] All tests pass (`python test_system.py`)
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Backup strategy implemented
- [ ] Monitoring setup complete

### Post-Deployment
- [ ] Health checks passing
- [ ] Performance metrics within SLA
- [ ] Error rates < 1%
- [ ] Response times < 200ms
- [ ] User acceptance testing complete

### Maintenance
- [ ] Regular model retraining scheduled
- [ ] Log rotation configured
- [ ] Security updates applied
- [ ] Performance monitoring active
- [ ] Backup verification routine

## 📞 Support & Maintenance

### Regular Tasks
- **Daily**: Check health metrics and error logs
- **Weekly**: Review performance analytics
- **Monthly**: Retrain ML model with new data
- **Quarterly**: Security audit and dependency updates

### Emergency Procedures
1. **Service Down**: Check health endpoints and restart services
2. **High Error Rate**: Check logs and rollback if needed
3. **Performance Issues**: Scale up resources or optimize queries
4. **Security Incident**: Isolate affected services and investigate

---

## 🎉 Success Metrics

### Technical KPIs
- **Uptime**: 99.9%+
- **Response Time**: <200ms average
- **Error Rate**: <1%
- **ML Accuracy**: >85%

### Business KPIs
- **Customer Satisfaction**: Improved routing accuracy
- **Agent Efficiency**: Reduced handling time
- **Queue Management**: Optimized wait times
- **System Adoption**: User engagement metrics

**🚀 Your AI Smart Queue Routing System is ready for production!**