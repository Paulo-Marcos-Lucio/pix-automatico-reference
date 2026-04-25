package dev.pmlsp.pixauto.infrastructure.cache;

import dev.pmlsp.pixauto.domain.port.out.IdempotencyStore;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RedisIdempotencyStore implements IdempotencyStore {

    private static final String KEY_PREFIX = "idem:";
    private static final String FIELD_FINGERPRINT = "fp";
    private static final String FIELD_PAYLOAD = "body";
    private static final String FIELD_STATUS = "status";
    private static final String FIELD_STATE = "state";
    private static final String STATE_RESERVED = "reserved";
    private static final String STATE_COMMITTED = "committed";

    private final StringRedisTemplate redis;

    @Override
    public Reservation reserve(String key, String fingerprint, Duration ttl) {
        String redisKey = KEY_PREFIX + key;
        Boolean created = redis.opsForHash().putIfAbsent(redisKey, FIELD_FINGERPRINT, fingerprint);
        if (Boolean.TRUE.equals(created)) {
            redis.opsForHash().put(redisKey, FIELD_STATE, STATE_RESERVED);
            redis.expire(redisKey, ttl);
            return new Reservation.Fresh(key);
        }
        Map<Object, Object> existing = redis.opsForHash().entries(redisKey);
        Object existingFp = existing.get(FIELD_FINGERPRINT);
        if (existingFp != null && !existingFp.equals(fingerprint)) {
            throw new IdempotencyConflictException(key);
        }
        if (STATE_COMMITTED.equals(existing.get(FIELD_STATE))) {
            int statusCode = Integer.parseInt(existing.get(FIELD_STATUS).toString());
            String body = (String) existing.get(FIELD_PAYLOAD);
            return new Reservation.Replay(body, statusCode);
        }
        return new Reservation.Fresh(key);
    }

    @Override
    public void commit(String key, String responsePayload, int statusCode) {
        String redisKey = KEY_PREFIX + key;
        redis.opsForHash().put(redisKey, FIELD_PAYLOAD, responsePayload);
        redis.opsForHash().put(redisKey, FIELD_STATUS, Integer.toString(statusCode));
        redis.opsForHash().put(redisKey, FIELD_STATE, STATE_COMMITTED);
    }

    @Override
    public void release(String key) {
        redis.delete(KEY_PREFIX + key);
    }

    @Override
    public Optional<Reservation.Replay> lookup(String key) {
        Map<Object, Object> existing = redis.opsForHash().entries(KEY_PREFIX + key);
        if (!STATE_COMMITTED.equals(existing.get(FIELD_STATE))) {
            return Optional.empty();
        }
        int statusCode = Integer.parseInt(existing.get(FIELD_STATUS).toString());
        return Optional.of(new Reservation.Replay((String) existing.get(FIELD_PAYLOAD), statusCode));
    }
}
