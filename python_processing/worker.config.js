module.exports = {
  apps: [{
    name: 'background-worker',
    script: 'venv/bin/python',
    args: 'background_worker.py',
    instances: 1,
    exec_mode: 'fork',
    cwd: '/home/ubuntu/Capstone_Interface/python_processing',
    error_file: './logs/worker-err.log',
    out_file: './logs/worker-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['venv', 'logs', '__pycache__']
  }]
};

