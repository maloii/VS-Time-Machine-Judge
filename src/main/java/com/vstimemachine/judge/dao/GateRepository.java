package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Gate;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface GateRepository extends CrudRepository<Gate, Long> {

    @Override
    Gate save(@Param("gate") Gate gate);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("gate") Gate gate);
}
