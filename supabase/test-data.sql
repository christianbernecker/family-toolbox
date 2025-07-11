-- Test-Daten für Family Toolbox Development
-- Diese Daten werden nur in der Entwicklungsumgebung eingefügt

-- Test Users (normalerweise werden diese von NextAuth erstellt)
INSERT INTO users (id, email, name, image, email_verified, created_at, updated_at) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@family-toolbox.de', 'Admin User', 'https://avatar.githubusercontent.com/u/1', NOW(), NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'user@family-toolbox.de', 'Family Member', 'https://avatar.githubusercontent.com/u/2', NOW(), NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Test Tool Settings
INSERT INTO user_tool_settings (user_id, tool_id, is_active, settings)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'bauplan-checker', true, '{"notifications": true, "auto_analysis": false}'),
  ('11111111-1111-1111-1111-111111111111', 'multi-agent-system', true, '{"email_monitoring": true, "alert_frequency": "daily"}'),
  ('22222222-2222-2222-2222-222222222222', 'bauplan-checker', true, '{"notifications": false, "auto_analysis": true}'),
  ('22222222-2222-2222-2222-222222222222', 'multi-agent-system', false, '{}')
ON CONFLICT (user_id, tool_id) DO NOTHING;

-- Test Bauplan Analyses
INSERT INTO bauplan_analyses (id, user_id, filename, original_filename, file_size, file_path, analysis_results, status, processing_duration_ms)
VALUES 
  (
    '33333333-3333-3333-3333-333333333333', 
    '11111111-1111-1111-1111-111111111111', 
    '2024_test_bauplan.pdf', 
    'Testbauplan_Einfamilienhaus.pdf', 
    2048576, 
    'bauplans/11111111-1111-1111-1111-111111111111/2024_test_bauplan.pdf',
    '{
      "compliance_score": 85,
      "violations": [
        {
          "type": "DIN_18040",
          "severity": "warning",
          "description": "Türbreite entspricht nicht den Mindestanforderungen für Barrierefreiheit"
        }
      ],
      "recommendations": [
        "Türbreite auf mindestens 80cm vergrößern",
        "Schwellenlose Übergänge prüfen"
      ],
      "total_pages": 12,
      "analyzed_elements": 45
    }',
    'completed',
    15000
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    '2024_garage_plan.pdf',
    'Garage_Neubau_2024.pdf',
    1024000,
    'bauplans/22222222-2222-2222-2222-222222222222/2024_garage_plan.pdf',
    '{"compliance_score": 95, "violations": [], "recommendations": ["Plane entspricht allen DIN-Normen"], "total_pages": 3, "analyzed_elements": 12}',
    'completed',
    8000
  )
ON CONFLICT (id) DO NOTHING;

-- Test Agent Configurations
INSERT INTO agent_configurations (id, user_id, agent_type, name, description, configuration, is_active, schedule, execution_count)
VALUES 
  (
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'email-monitor',
    'Email Scanner für Immobilien',
    'Überwacht Emails nach neuen Immobilienangeboten und interessanten Bauvorschriften-Updates',
    '{
      "email_filters": {
        "keywords": ["Immobilie", "Bauvorschrift", "DIN-Norm", "Bauplan"],
        "senders": ["immobilienscout24@*", "noreply@din.de"]
      },
      "notification_settings": {
        "immediate": true,
        "summary": "daily"
      },
      "analysis_settings": {
        "extract_attachments": true,
        "sentiment_analysis": false
      }
    }',
    true,
    '0 */4 * * *',
    24
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'content-summarizer',
    'Newsletter Zusammenfassung',
    'Fasst wichtige Newsletter und Fachliteratur zusammen',
    '{
      "sources": ["newsletter", "rss"],
      "summary_length": "medium",
      "topics": ["Bauwesen", "Architektur", "Energieeffizienz"],
      "output_format": "markdown"
    }',
    true,
    '0 8 * * MON',
    4
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    '22222222-2222-2222-2222-222222222222',
    'email-monitor',
    'Persönlicher Email-Filter',
    'Filtert wichtige private Emails',
    '{
      "email_filters": {
        "keywords": ["Familie", "Termin", "Rechnung"],
        "priority_senders": ["bank@*", "versicherung@*"]
      },
      "notification_settings": {
        "immediate": false,
        "summary": "weekly"
      }
    }',
    false,
    '0 9 * * SUN',
    0
  )
ON CONFLICT (id) DO NOTHING;

-- Test Agent Results
INSERT INTO agent_results (agent_config_id, execution_time, results, status, duration_ms, metadata)
VALUES 
  (
    '55555555-5555-5555-5555-555555555555',
    NOW() - INTERVAL '2 hours',
    '{
      "emails_processed": 15,
      "relevant_emails": 3,
      "extracted_data": [
        {
          "subject": "Neue DIN 18040-1 Aktualisierung verfügbar",
          "sender": "noreply@din.de",
          "summary": "Wichtige Updates zu Barrierefreiheit im Bauwesen",
          "attachments": ["DIN_18040_Update_2024.pdf"],
          "relevance_score": 0.92
        }
      ],
      "notifications_sent": 1
    }',
    'success',
    4500,
    '{"processing_mode": "full", "email_count": 15}'
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    NOW() - INTERVAL '1 day',
    '{
      "sources_processed": 8,
      "articles_summarized": 12,
      "summary": "Diese Woche: Neue Energieeffizienz-Standards, Updates zu KfW-Förderungen, Trends in nachhaltiger Architektur",
      "key_topics": ["Energieeffizienz", "KfW-Förderung", "Nachhaltigkeit"],
      "reading_time_minutes": 15
    }',
    'success',
    12000,
    '{"summary_type": "weekly", "word_count": 450}'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    NOW() - INTERVAL '6 hours',
    '{}',
    'error',
    1200,
    '{"error_type": "connection_timeout", "retry_count": 3}'
  )
ON CONFLICT DO NOTHING;

-- Test File Uploads
INSERT INTO file_uploads (user_id, tool_id, filename, original_filename, mime_type, file_size, storage_path, metadata, status)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'bauplan-checker',
    '2024_01_15_bauplan.pdf',
    'Einfamilienhaus_Grundriss.pdf',
    'application/pdf',
    2048576,
    'uploads/bauplan-checker/11111111-1111-1111-1111-111111111111/2024_01_15_bauplan.pdf',
    '{"pages": 12, "ocr_required": true, "upload_source": "web"}',
    'processed'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'bauplan-checker',
    '2024_01_16_garage.pdf',
    'Garage_Bauzeichnung.pdf',
    'application/pdf',
    1024000,
    'uploads/bauplan-checker/22222222-2222-2222-2222-222222222222/2024_01_16_garage.pdf',
    '{"pages": 3, "ocr_required": false, "upload_source": "web"}',
    'processed'
  )
ON CONFLICT DO NOTHING;

-- Test Audit Logs
INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, ip_address, user_agent)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'CREATE',
    'bauplan_analyses',
    '33333333-3333-3333-3333-333333333333',
    '{"filename": "2024_test_bauplan.pdf", "status": "processing"}',
    '192.168.1.100',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'UPDATE',
    'bauplan_analyses',
    '33333333-3333-3333-3333-333333333333',
    '{"status": "completed", "analysis_results": {...}}',
    '192.168.1.100',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'UPDATE',
    'user_tool_settings',
    null,
    '{"tool_id": "multi-agent-system", "is_active": false}',
    '192.168.1.101',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
  )
ON CONFLICT DO NOTHING; 