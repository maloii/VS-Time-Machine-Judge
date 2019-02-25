package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Round;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;
import java.util.List;

@Transactional
public interface RoundRepository extends CrudRepository<Round, Long> {
    @Override
    Round save(@Param("round") Round round);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("round") Round round);

}
