package com.grishin.leetcodemotivation.user;

import com.grishin.leetcodemotivation.stats.LeetcodeClient;
import com.grishin.leetcodemotivation.stats.dto.SolvedTasks;
import com.grishin.leetcodemotivation.user.dto.LoginRequest;
import com.grishin.leetcodemotivation.user.dto.SignupRequest;
import com.grishin.leetcodemotivation.user.dto.User;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.time.Instant;
import java.util.Optional;

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private LeetcodeClient leetcodeClient;

    public User login(@Valid LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        return userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("User " + request.email() + " not found"));
    }

    public void signup(@Valid SignupRequest request) {
        log.info("New signup request: username: {}, email: {}, leetcode account: {}", request.username(), request.email(), request.leetcodeAccount());
        String email = request.email();
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            throw new HttpClientErrorException(HttpStatus.CONFLICT,
                    String.format("User with the email address '%s' already exists.", email));
        }
        SolvedTasks currentStat = leetcodeClient.getCurrentStat(request.leetcodeAccount());
        log.info("Current stat of new {} account {}", request.username(), currentStat);
        String hashedPassword = passwordEncoder.encode(request.password());
        User user = new User(request.username(), email, hashedPassword, request.leetcodeAccount(), Instant.now());
        user.setSolvedTasks(currentStat);
        userRepository.saveAndFlush(user);
        log.info("Account {} successfully saved", request.username());
    }

    public Optional<User> findUser(String email) {
        return userRepository.findByEmail(email);
    }
}
