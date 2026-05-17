package com.grishin.leetcodemotivation.user;

import com.grishin.leetcodemotivation.user.dto.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    default User findByUsername(String username) {
        return findById(username).orElse(null);
    }
}
