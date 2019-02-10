package com.vstimemachine.judge.component;

import com.vstimemachine.judge.dao.JudgeRepository;
import com.vstimemachine.judge.model.Judge;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class SpringDataJpaUserDetailsService  implements UserDetailsService {

    private final JudgeRepository repository;

    @Autowired
    public SpringDataJpaUserDetailsService(JudgeRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String name) throws UsernameNotFoundException {
        Judge judge = this.repository.findByName(name);
        return new User(judge.getName(), judge.getPassword(),
                AuthorityUtils.createAuthorityList(judge.getRoles()));
    }

}