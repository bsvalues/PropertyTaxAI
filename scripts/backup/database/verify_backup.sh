#!/bin/bash

verify_backup() {
    local backup_file="$1"
    local verify_db="verify_$(date +%s)"
    
    log "Creating temporary database for verification"
    docker-compose exec -T db createdb "$verify_db"
    
    # Restore to temporary DB
    gunzip -c "$backup_file" | docker-compose exec -T db psql -U postgres "$verify_db"
    
    # Run verification queries
    docker-compose exec -T db psql -U postgres "$verify_db" -c "
        SELECT COUNT(*) as total_properties FROM properties;
        SELECT COUNT(*) as total_assessments FROM assessments;
        SELECT MAX(updated_at) as latest_update FROM assessments;
    " > backup_verification.log
    
    # Cleanup
    docker-compose exec -T db dropdb "$verify_db"
} 