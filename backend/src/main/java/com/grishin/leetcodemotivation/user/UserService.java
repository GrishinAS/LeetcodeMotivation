package com.grishin.leetcodemotivation.user;

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

import java.util.Date;
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

    public User login(@Valid LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        Optional<User> existingUser = userRepository.findByEmail(request.email());
        if (existingUser.isEmpty()) throw new UsernameNotFoundException("User " + request.email() + " is not found");
        return existingUser.get();
    }

    public void signup(SignupRequest request) {
        log.info("New signup request: username: {}, email: {}, leetcode account: {}", request.username(), request.email(), request.leetcodeAccount());
        String email = request.email();
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            throw new HttpClientErrorException(HttpStatus.CONFLICT, String.format("User with the email address '%s' already exists.", email));
        }

        String hashedPassword = passwordEncoder.encode(request.password());
        User user = new User(request.username(), email, hashedPassword, request.leetcodeAccount(), new Date());
        userRepository.saveAndFlush(user);
        log.info("Account {} successfully saved", request.username());
    }
}
