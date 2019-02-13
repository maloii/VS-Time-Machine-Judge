package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Competition;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface CompetitionRepository extends CrudRepository<Competition, Long> {

    @Override
    Competition save(@Param("competition") Competition pilot);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("competition") Competition pilot);
}
