package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Settings;
import com.vstimemachine.judge.model.TypeSettings;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Transactional
public interface SettingsRepository extends CrudRepository<Settings, Long> {

    @Override
    Settings save(@Param("settings") Settings settings);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("settings") Settings settings);

    Settings findByTypeSettings(TypeSettings typeSettings);
}
