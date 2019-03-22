package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Broadcast;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;
import java.util.Optional;

@Transactional
public interface BroadcastRepository extends CrudRepository<Broadcast, Long> {
    @Override
    Broadcast save(@Param("broadcast") Broadcast broadcast);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("broadcast") Broadcast broadcast);
}