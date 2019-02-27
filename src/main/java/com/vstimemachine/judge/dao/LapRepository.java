package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Lap;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface LapRepository  extends CrudRepository<Lap, Long> {

    @Override
    Lap save(@Param("lap") Lap lap);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("lap") Lap lap);
}