package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Judge;
import org.springframework.data.repository.Repository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(exported = false)
public interface JudgeRepository  extends Repository<Judge, Long> {

    Judge save(Judge judge);

    Judge findByName(String name);

}
