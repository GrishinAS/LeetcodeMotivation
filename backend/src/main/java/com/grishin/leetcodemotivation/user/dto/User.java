package com.grishin.leetcodemotivation.user.dto;

import com.grishin.leetcodemotivation.stats.dto.SolvedTasks;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "users")
public final class User {

    @Id
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "hashed_pw")
    private String hashedPw;

    @Column(name = "leetcode_acc")
    private String leetcodeAcc;

    @Column(name = "last_login")
    private Instant lastLogin;

    @Column(name = "current_points")
    private int currentPoints = 0;

    @Embedded
    private SolvedTasks solvedTasks;

    public User() {}

    public User(String username, String email, String hashedPw, String leetcodeAcc, Instant lastLogin) {
        this.username = username;
        this.email = email;
        this.hashedPw = hashedPw;
        this.leetcodeAcc = leetcodeAcc;
        this.lastLogin = lastLogin;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getHashedPw() { return hashedPw; }
    public void setHashedPw(String hashedPw) { this.hashedPw = hashedPw; }

    public String getLeetcodeAcc() { return leetcodeAcc; }
    public void setLeetcodeAcc(String leetcodeAcc) { this.leetcodeAcc = leetcodeAcc; }

    public Instant getLastLogin() { return lastLogin; }
    public void setLastLogin(Instant lastLogin) { this.lastLogin = lastLogin; }

    public int getCurrentPoints() { return currentPoints; }
    public void setCurrentPoints(int currentPoints) { this.currentPoints = currentPoints; }

    public SolvedTasks getSolvedTasks() { return solvedTasks; }
    public void setSolvedTasks(SolvedTasks solvedTasks) { this.solvedTasks = solvedTasks; }
}
