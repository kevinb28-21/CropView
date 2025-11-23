module.exports = {
  apps: [{
    name: 'flask-api',
    interpreter: 'venv/bin/python',
    script: 'venv/bin/gunicorn',
    args: ['-w', '4', '-b', '0.0.0.0:5001', 'flask_api_db:app'],
    instances: 1,
    exec_mode: 'fork',
    cwd: '/home/ubuntu/Capstone_Interface/python_processing',
    env: {
      FLASK_PORT: 5001,
      FLASK_DEBUG: 'False'
    },
    error_file: './logs/flask-err.log',
    out_file: './logs/flask-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['venv', 'logs', '__pycache__']
  }]
};

