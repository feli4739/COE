-- Usuarios demo (bcrypt). Idempotente con ON CONFLICT.
-- admin@fireburst.local / FireBurst2025!
-- demo@fireburst.local / demo1234

INSERT INTO users (email, password_hash) VALUES
  (
    'admin@fireburst.local',
    '$2a$10$Po8cmRvJn4ZXJoTnevn.6uMAsSPYI8QGxF3f1MUnd24p2Bpv.hp.q'
  ),
  (
    'demo@fireburst.local',
    '$2a$10$Y8ELno7sfKcgtQ2pvR/zBesC.FslQ.RkHPP/y8dWFE9FgYtHNzCqW'
  )
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
